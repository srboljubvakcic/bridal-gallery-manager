import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

interface Photo {
  id: string;
  gallery_id: string;
  image_url: string;
  title: string | null;
  display_order: number;
}

interface Gallery {
  id: string;
  name: string;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

// Compress image to target size
const compressImage = (file: File, maxSizeMB: number = 2): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        
        // Calculate new dimensions while maintaining aspect ratio
        const maxDimension = 2000; // Max width/height
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        // Start with high quality and reduce if needed
        let quality = 0.9;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;

        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Failed to compress image"));
                return;
              }

              if (blob.size > maxSizeBytes && quality > 0.1) {
                quality -= 0.1;
                tryCompress();
              } else {
                resolve(blob);
              }
            },
            "image/jpeg",
            quality
          );
        };

        tryCompress();
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

const AdminPhotos = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [selectedGallery, setSelectedGallery] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletePhoto, setDeletePhoto] = useState<Photo | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTotal, setUploadTotal] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchGalleries = async () => {
    const { data } = await supabase
      .from("galleries")
      .select("id, name")
      .order("name");

    if (data) {
      setGalleries(data);
      if (data.length > 0 && !selectedGallery) {
        setSelectedGallery(data[0].id);
      }
    }
  };

  const fetchPhotos = async () => {
    if (!selectedGallery) {
      setPhotos([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("photos")
      .select("*")
      .eq("gallery_id", selectedGallery)
      .order("display_order", { ascending: true });

    if (!error && data) {
      setPhotos(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGalleries();
  }, []);

  useEffect(() => {
    if (selectedGallery) {
      setLoading(true);
      fetchPhotos();
    }
  }, [selectedGallery]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedGallery) return;

    setUploading(true);
    setUploadProgress(0);
    setUploadTotal(files.length);

    let completed = 0;

    for (const file of Array.from(files)) {
      try {
        // Compress image if larger than 2MB
        let fileToUpload: Blob | File = file;
        if (file.size > MAX_FILE_SIZE) {
          toast.info(`Kompresija: ${file.name}...`);
          fileToUpload = await compressImage(file, 2);
        }

        const fileExt = "jpg"; // Always save as jpg after compression
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${selectedGallery}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("photos")
          .upload(filePath, fileToUpload, {
            contentType: "image/jpeg",
          });

        if (uploadError) {
          toast.error(`Greška pri uploadu: ${file.name}`);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from("photos")
          .getPublicUrl(filePath);

        const { error: insertError } = await supabase.from("photos").insert({
          gallery_id: selectedGallery,
          image_url: publicUrl,
          title: file.name.replace(/\.[^/.]+$/, ""),
          display_order: photos.length + completed,
        });

        if (insertError) {
          toast.error(`Greška pri spremanju: ${file.name}`);
        }

        completed++;
        setUploadProgress(completed);
      } catch (error) {
        console.error("Upload error:", error);
        toast.error(`Greška: ${file.name}`);
      }
    }

    toast.success(`Uspješno uploadano ${completed} fotografija`);
    fetchPhotos();
    setUploading(false);
    setUploadProgress(0);
    setUploadTotal(0);
    setIsDialogOpen(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    if (!deletePhoto) return;

    // Extract file path from URL
    const urlParts = deletePhoto.image_url.split("/photos/");
    if (urlParts.length > 1) {
      const filePath = urlParts[1];
      await supabase.storage.from("photos").remove([filePath]);
    }

    const { error } = await supabase
      .from("photos")
      .delete()
      .eq("id", deletePhoto.id);

    if (error) {
      toast.error("Greška pri brisanju fotografije");
    } else {
      toast.success("Fotografija uspješno obrisana");
      fetchPhotos();
    }

    setDeletePhoto(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-foreground mb-2">Fotografije</h1>
          <p className="text-muted-foreground">Upravljajte fotografijama u galerijama</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!selectedGallery}>
              <Plus className="w-4 h-4 mr-2" />
              Dodaj Fotografije
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Fotografija</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Galerija</Label>
                <p className="text-muted-foreground text-sm">
                  {galleries.find((g) => g.id === selectedGallery)?.name}
                </p>
              </div>
              <div>
                <Label htmlFor="photos">Odaberi fotografije</Label>
                <Input
                  id="photos"
                  type="file"
                  accept="image/*"
                  multiple
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="mt-1.5"
                />
                <p className="text-muted-foreground text-xs mt-1">
                  Možete odabrati više fotografija. Slike veće od 2MB će biti automatski kompresovane.
                </p>
              </div>
              {uploading && (
                <div className="space-y-2">
                  <p className="text-primary text-sm">
                    Uploadam fotografije... ({uploadProgress}/{uploadTotal})
                  </p>
                  <Progress value={(uploadProgress / uploadTotal) * 100} />
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Gallery Filter */}
      <div className="mb-6">
        <Label>Odaberi Galeriju</Label>
        <Select value={selectedGallery} onValueChange={setSelectedGallery}>
          <SelectTrigger className="w-64 mt-1.5">
            <SelectValue placeholder="Odaberi galeriju" />
          </SelectTrigger>
          <SelectContent>
            {galleries.map((gallery) => (
              <SelectItem key={gallery.id} value={gallery.id}>
                {gallery.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Photos Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      ) : galleries.length === 0 ? (
        <div className="bg-card rounded-lg p-12 text-center">
          <p className="text-muted-foreground">
            Prvo kreirajte galeriju da biste mogli dodati fotografije
          </p>
        </div>
      ) : photos.length === 0 ? (
        <div className="bg-card rounded-lg p-12 text-center">
          <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            Nema fotografija u ovoj galeriji
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload fotografije
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative aspect-square rounded-lg overflow-hidden bg-muted">
              <img
                src={photo.image_url}
                alt={photo.title || "Photo"}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => setDeletePhoto(photo)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deletePhoto} onOpenChange={() => setDeletePhoto(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Obrisati fotografiju?</AlertDialogTitle>
            <AlertDialogDescription>
              Ova akcija će trajno obrisati fotografiju. Ova akcija se ne može poništiti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Otkaži</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Obriši
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPhotos;