import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useSectionVisibility } from "@/hooks/useSectionVisibility";

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { settings, loading: settingsLoading } = useSiteSettings();
  const { t } = useLanguage();
  const { sections } = useSectionVisibility();

  const allNavLinks = [
    { href: "#o-meni", label: t.nav.about, section: "about" as const },
    { href: "#galerija", label: t.nav.gallery, section: "gallery" as const },
    { href: "#paketi", label: t.nav.packages, section: "packages" as const },
    { href: "#recenzije", label: t.nav.testimonials, section: "testimonials" as const },
    { href: "#kontakt", label: t.nav.contact, section: "contact" as const },
  ];

  const navLinks = allNavLinks.filter((link) => sections[link.section]);

  // Check if we're on a subpage (not homepage)
  const isSubpage = location.pathname !== "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (location.pathname === "/" && href.startsWith("#")) {
      e.preventDefault();
      const element = document.getElementById(href.slice(1));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
      setIsMobileMenuOpen(false);
    }
  };

  // Determine if navbar should have dark background
  const hasDarkBg = isScrolled || isSubpage;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        hasDarkBg
          ? "bg-charcoal/95 backdrop-blur-sm shadow-soft py-4"
          : "bg-transparent py-6"
      )}
    >
      <div className="container flex items-center justify-between">
        <Link
          to="/"
          className="text-cream transition-colors"
        >
          {settingsLoading ? (
            <div className="h-8 md:h-10 w-32" />
          ) : settings.footer.logo ? (
            <img 
              src={settings.footer.logo} 
              alt={settings.footer.brand_name || "Logo"} 
              className="h-8 md:h-10 object-contain brightness-0 invert"
            />
          ) : (
            <span className="font-serif text-2xl md:text-3xl tracking-wide">
              {settings.footer.brand_name}
            </span>
          )}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="nav-link text-cream/80 hover:text-cream transition-colors"
            >
              {link.label}
            </a>
          ))}
          <LanguageSwitcher isScrolled={false} />
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-3">
          <LanguageSwitcher isScrolled={false} />
          <button
            className="p-2 text-cream transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <nav className="md:hidden absolute top-full left-0 right-0 bg-charcoal border-t border-cream/20 animate-fade-in">
          <div className="container py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="nav-link text-cream/80 hover:text-cream py-2"
                onClick={(e) => handleNavClick(e, link.href)}
              >
                {link.label}
              </a>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
};
