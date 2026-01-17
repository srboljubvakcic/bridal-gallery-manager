import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FolderOpen, Image, Package, MessageSquare, Star, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Stats {
  galleries: number;
  photos: number;
  packages: number;
  messages: number;
  unreadMessages: number;
  testimonials: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [galleriesRes, photosRes, packagesRes, messagesRes, unreadRes, testimonialsRes] = await Promise.all([
        supabase.from("galleries").select("id", { count: "exact", head: true }),
        supabase.from("photos").select("id", { count: "exact", head: true }),
        supabase.from("packages").select("id", { count: "exact", head: true }),
        supabase.from("messages").select("id", { count: "exact", head: true }),
        supabase.from("messages").select("id", { count: "exact", head: true }).eq("is_read", false),
        supabase.from("testimonials").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        galleries: galleriesRes.count || 0,
        photos: photosRes.count || 0,
        packages: packagesRes.count || 0,
        messages: messagesRes.count || 0,
        unreadMessages: unreadRes.count || 0,
        testimonials: testimonialsRes.count || 0,
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: "Galerije", value: stats?.galleries, icon: FolderOpen, href: "/admin/galleries", color: "bg-blue-500/10 text-blue-600" },
    { label: "Fotografije", value: stats?.photos, icon: Image, href: "/admin/photos", color: "bg-green-500/10 text-green-600" },
    { label: "Paketi", value: stats?.packages, icon: Package, href: "/admin/packages", color: "bg-amber-500/10 text-amber-600" },
    { label: "Poruke", value: stats?.messages, badge: stats?.unreadMessages, icon: MessageSquare, href: "/admin/messages", color: "bg-purple-500/10 text-purple-600" },
    { label: "Recenzije", value: stats?.testimonials, icon: Star, href: "/admin/testimonials", color: "bg-rose-500/10 text-rose-600" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Dobrodošli nazad! Ovdje možete upravljati svojim websajtom.
        </p>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card) => (
            <Link
              key={card.label}
              to={card.href}
              className="bg-card rounded-lg p-6 shadow-card hover:shadow-soft transition-shadow group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center`}>
                  <card.icon className="w-6 h-6" />
                </div>
                {card.badge !== undefined && card.badge > 0 && (
                  <span className="bg-destructive text-destructive-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                    {card.badge} novo
                  </span>
                )}
              </div>
              <p className="text-3xl font-serif text-foreground mb-1">{card.value}</p>
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-sm">{card.label}</p>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-12">
        <h2 className="font-serif text-xl text-foreground mb-4">Brze Akcije</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/galleries"
            className="bg-card rounded-lg p-4 shadow-card hover:shadow-soft transition-shadow text-center"
          >
            <FolderOpen className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">Dodaj Galeriju</p>
          </Link>
          <Link
            to="/admin/photos"
            className="bg-card rounded-lg p-4 shadow-card hover:shadow-soft transition-shadow text-center"
          >
            <Image className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">Dodaj Fotografije</p>
          </Link>
          <Link
            to="/admin/packages"
            className="bg-card rounded-lg p-4 shadow-card hover:shadow-soft transition-shadow text-center"
          >
            <Package className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">Uredi Pakete</p>
          </Link>
          <Link
            to="/admin/messages"
            className="bg-card rounded-lg p-4 shadow-card hover:shadow-soft transition-shadow text-center"
          >
            <MessageSquare className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">Pregledaj Poruke</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
