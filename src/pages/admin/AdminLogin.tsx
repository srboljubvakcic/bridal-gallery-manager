import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Unesite validnu email adresu"),
  password: z.string().min(6, "Lozinka mora imati najmanje 6 karaktera"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const AdminLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, isAdmin } = useAuth();
  const { settings } = useSiteSettings();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    
    const { error } = await signIn(data.email, data.password);

    if (error) {
      toast.error("Pogrešan email ili lozinka");
      setIsLoading(false);
      return;
    }

    // Small delay to allow role check to complete
    setTimeout(() => {
      navigate("/admin/dashboard");
    }, 500);
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-sm p-8 shadow-elegant">
          <div className="text-center mb-8">
            {settings.footer.logo ? (
              <img 
                src={settings.footer.logo} 
                alt={settings.footer.brand_name || "Logo"} 
                className="h-12 mx-auto mb-4 object-contain"
              />
            ) : (
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="w-8 h-8 text-primary" />
              </div>
            )}
            <h1 className="font-serif text-2xl text-foreground mb-2">
              Admin Panel
            </h1>
            <p className="text-muted-foreground text-sm">
              Prijavite se da pristupite administraciji
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="admin@weddingphoto.com"
                className="mt-1.5"
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-destructive text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Lozinka</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-destructive text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Prijavljivanje..." : "Prijavi se"}
            </Button>
          </form>
        </div>

        <p className="text-center text-cream/40 text-xs mt-6">
          © {new Date().getFullYear()} {settings.footer.brand_name}
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
