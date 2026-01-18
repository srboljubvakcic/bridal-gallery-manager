import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, Lock, Mail, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const AdminSettings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Unesite novu email adresu");
      return;
    }

    if (email === user?.email) {
      toast.error("Nova email adresa mora biti različita od trenutne");
      return;
    }

    setSavingEmail(true);

    const { error } = await supabase.auth.updateUser({ email });

    if (error) {
      toast.error("Greška pri promjeni email-a", {
        description: error.message,
      });
      setSavingEmail(false);
      return;
    }
    
    toast.success("Email uspješno promijenjen! ✨", {
      description: "Bićete odjavljeni. Prijavite se sa novim email-om.",
    });
    
    // Sign out and redirect to login
    setTimeout(async () => {
      await signOut();
      navigate("/admin");
    }, 1500);

    setSavingEmail(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error("Unesite novu šifru");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Šifre se ne podudaraju");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Šifra mora imati najmanje 6 karaktera");
      return;
    }

    setSavingPassword(true);

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      toast.error("Greška pri promjeni šifre", {
        description: error.message,
      });
      setSavingPassword(false);
      return;
    }
    
    toast.success("Šifra uspješno promijenjena! 🔒", {
      description: "Bićete odjavljeni. Prijavite se sa novom šifrom.",
    });
    
    // Sign out and redirect to login
    setTimeout(async () => {
      await signOut();
      navigate("/admin");
    }, 1500);

    setSavingPassword(false);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-foreground mb-2">Podešavanja Naloga</h1>
        <p className="text-muted-foreground">
          Promijenite email adresu ili šifru
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Email Change */}
        <div className="bg-card rounded-lg p-6 shadow-card">
          <h2 className="font-serif text-xl text-foreground mb-6 flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Promjena Email Adrese
          </h2>
          <form onSubmit={handleEmailChange} className="space-y-4">
            <div>
              <Label htmlFor="current-email">Trenutni email</Label>
              <div className="flex items-center gap-2 mt-1.5">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{user?.email}</span>
              </div>
            </div>
            <div>
              <Label htmlFor="new-email">Nova email adresa</Label>
              <Input
                id="new-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nova@email.com"
                className="mt-1.5"
              />
            </div>
            <div className="p-3 bg-amber-50 rounded-md border border-amber-200">
              <p className="text-amber-800 text-sm flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Nakon promjene bićete odjavljeni
              </p>
            </div>
            <Button type="submit" disabled={savingEmail} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {savingEmail ? "Spremam..." : "Promijeni Email i Odjavi se"}
            </Button>
          </form>
        </div>

        {/* Password Change */}
        <div className="bg-card rounded-lg p-6 shadow-card">
          <h2 className="font-serif text-xl text-foreground mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Promjena Šifre
          </h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <Label htmlFor="new-password">Nova šifra</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Potvrdite novu šifru</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1.5"
              />
            </div>
            <div className="p-3 bg-amber-50 rounded-md border border-amber-200">
              <p className="text-amber-800 text-sm flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Nakon promjene bićete odjavljeni
              </p>
            </div>
            <Button type="submit" disabled={savingPassword} className="w-full">
              <Lock className="w-4 h-4 mr-2" />
              {savingPassword ? "Spremam..." : "Promijeni Šifru i Odjavi se"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;