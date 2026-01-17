import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { settings } = useSiteSettings();

  return (
    <footer className="bg-charcoal text-cream/90 py-16">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-2xl text-cream mb-4">{settings.footer.brand_name}</h3>
            <p className="text-cream/70 text-sm leading-relaxed mb-6">
              {settings.footer.description}
            </p>
            <div className="flex gap-4">
              {settings.contact.instagram && (
                <a
                  href={settings.contact.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cream/70 hover:text-champagne transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
              )}
              {settings.contact.facebook && (
                <a
                  href={settings.contact.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cream/70 hover:text-champagne transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook size={20} />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg text-cream mb-4">Brze Veze</h4>
            <nav className="flex flex-col gap-2">
              <a href="#about" className="text-cream/70 hover:text-champagne transition-colors text-sm">
                O meni
              </a>
              <a href="#gallery" className="text-cream/70 hover:text-champagne transition-colors text-sm">
                Galerija
              </a>
              <a href="#packages" className="text-cream/70 hover:text-champagne transition-colors text-sm">
                Paketi i cijene
              </a>
              <a href="#contact" className="text-cream/70 hover:text-champagne transition-colors text-sm">
                Kontakt
              </a>
            </nav>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-serif text-lg text-cream mb-4">Kontakt</h4>
            <div className="flex flex-col gap-3">
              <a
                href={`mailto:${settings.contact.email}`}
                className="flex items-center gap-3 text-cream/70 hover:text-champagne transition-colors text-sm"
              >
                <Mail size={16} />
                {settings.contact.email}
              </a>
              <a
                href={`tel:${settings.contact.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-3 text-cream/70 hover:text-champagne transition-colors text-sm"
              >
                <Phone size={16} />
                {settings.contact.phone}
              </a>
              <div className="flex items-center gap-3 text-cream/70 text-sm">
                <MapPin size={16} />
                {settings.contact.address}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-cream/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-cream/50 text-xs">
            © {currentYear} {settings.footer.brand_name}. Sva prava zadržana.
          </p>
          <Link
            to="/admin"
            className="text-cream/30 hover:text-cream/50 text-xs transition-colors"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
};
