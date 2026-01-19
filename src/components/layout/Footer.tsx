import { Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useLanguage } from "@/contexts/LanguageContext";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { settings } = useSiteSettings();
  const { t } = useLanguage();

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
            <h4 className="font-serif text-lg text-cream mb-4">
              {t.nav.about === "About" ? "Quick Links" : t.nav.about === "Über mich" ? "Schnelllinks" : "Brze Veze"}
            </h4>
            <nav className="flex flex-col gap-2">
              <a href="#o-meni" className="text-cream/70 hover:text-champagne transition-colors text-sm">
                {t.nav.about}
              </a>
              <a href="#galerija" className="text-cream/70 hover:text-champagne transition-colors text-sm">
                {t.nav.gallery}
              </a>
              <a href="#paketi" className="text-cream/70 hover:text-champagne transition-colors text-sm">
                {t.nav.packages}
              </a>
              <a href="#kontakt" className="text-cream/70 hover:text-champagne transition-colors text-sm">
                {t.nav.contact}
              </a>
            </nav>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-serif text-lg text-cream mb-4">{t.nav.contact}</h4>
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

        <div className="border-t border-cream/20 pt-8 flex justify-center items-center">
          <p className="text-cream/50 text-xs">
            © {currentYear} {settings.footer.brand_name}. {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
};
