import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-charcoal text-cream/90 py-16">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-2xl text-cream mb-4">Ana Fotografija</h3>
            <p className="text-cream/70 text-sm leading-relaxed mb-6">
              Profesionalna fotografija vjenčanja. Bilježim vaše najljepše trenutke 
              s pažnjom prema detaljima i emocijama.
            </p>
            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream/70 hover:text-champagne transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream/70 hover:text-champagne transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg text-cream mb-4">Brze Veze</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/about" className="text-cream/70 hover:text-champagne transition-colors text-sm">
                O meni
              </Link>
              <Link to="/gallery" className="text-cream/70 hover:text-champagne transition-colors text-sm">
                Galerija
              </Link>
              <Link to="/packages" className="text-cream/70 hover:text-champagne transition-colors text-sm">
                Paketi i cijene
              </Link>
              <Link to="/contact" className="text-cream/70 hover:text-champagne transition-colors text-sm">
                Kontakt
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-serif text-lg text-cream mb-4">Kontakt</h4>
            <div className="flex flex-col gap-3">
              <a
                href="mailto:info@anafotografija.com"
                className="flex items-center gap-3 text-cream/70 hover:text-champagne transition-colors text-sm"
              >
                <Mail size={16} />
                info@anafotografija.com
              </a>
              <a
                href="tel:+38761234567"
                className="flex items-center gap-3 text-cream/70 hover:text-champagne transition-colors text-sm"
              >
                <Phone size={16} />
                +387 61 234 567
              </a>
              <div className="flex items-center gap-3 text-cream/70 text-sm">
                <MapPin size={16} />
                Sarajevo, Bosna i Hercegovina
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-cream/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-cream/50 text-xs">
            © {currentYear} Ana Fotografija. Sva prava zadržana.
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
