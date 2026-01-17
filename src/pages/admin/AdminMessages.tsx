import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Mail, Phone, Calendar, Eye, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  event_date: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

const AdminMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<Message | null>(null);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setMessages(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const markAsRead = async (message: Message) => {
    if (message.is_read) return;

    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("id", message.id);

    setMessages(
      messages.map((m) => (m.id === message.id ? { ...m, is_read: true } : m))
    );
  };

  const handleViewMessage = (message: Message) => {
    setSelectedMessage(message);
    markAsRead(message);
  };

  const handleDelete = async () => {
    if (!deleteMessage) return;

    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", deleteMessage.id);

    if (error) {
      toast.error("Greška pri brisanju poruke");
    } else {
      toast.success("Poruka uspješno obrisana");
      fetchMessages();
    }

    setDeleteMessage(null);
    setSelectedMessage(null);
  };

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-foreground mb-2">Poruke</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} nepročitanih poruka`
              : "Sve poruke su pročitane"}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-card rounded-lg p-12 text-center">
          <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nemate nijednu poruku</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg shadow-card overflow-hidden">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex items-start gap-4 p-4 border-b border-border last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors",
                !message.is_read && "bg-primary/5"
              )}
              onClick={() => handleViewMessage(message)}
            >
              <div
                className={cn(
                  "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                  message.is_read ? "bg-muted" : "bg-primary"
                )}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={cn("font-medium text-foreground", !message.is_read && "font-semibold")}>
                    {message.name}
                  </h3>
                  <span className="text-muted-foreground text-xs">
                    {format(new Date(message.created_at), "dd.MM.yyyy HH:mm")}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">{message.email}</p>
                <p className="text-muted-foreground text-sm truncate mt-1">
                  {message.message}
                </p>
              </div>
              <Button variant="ghost" size="icon">
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* View Message Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Poruka od {selectedMessage?.name}</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4 text-sm">
                <a
                  href={`mailto:${selectedMessage.email}`}
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Mail className="w-4 h-4" />
                  {selectedMessage.email}
                </a>
                {selectedMessage.phone && (
                  <a
                    href={`tel:${selectedMessage.phone}`}
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Phone className="w-4 h-4" />
                    {selectedMessage.phone}
                  </a>
                )}
                {selectedMessage.event_date && (
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(selectedMessage.event_date), "dd.MM.yyyy")}
                  </span>
                )}
              </div>
              <div className="bg-muted rounded-lg p-4">
                <p className="text-foreground whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>
              <p className="text-muted-foreground text-xs">
                Primljeno: {format(new Date(selectedMessage.created_at), "dd.MM.yyyy u HH:mm")}
              </p>
              <div className="flex gap-2 pt-4">
                <Button asChild className="flex-1">
                  <a href={`mailto:${selectedMessage.email}`}>
                    <Mail className="w-4 h-4 mr-2" />
                    Odgovori
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleteMessage(selectedMessage)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteMessage} onOpenChange={() => setDeleteMessage(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Obrisati poruku?</AlertDialogTitle>
            <AlertDialogDescription>
              Ova akcija će trajno obrisati poruku od "{deleteMessage?.name}". 
              Ova akcija se ne može poništiti.
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

export default AdminMessages;
