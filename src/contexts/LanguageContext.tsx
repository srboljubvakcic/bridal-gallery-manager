import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "sr" | "en" | "de";

interface Translations {
  nav: {
    about: string;
    gallery: string;
    packages: string;
    testimonials: string;
    contact: string;
  };
  hero: {
    cta_primary: string;
    cta_secondary: string;
  };
  about: {
    subtitle: string;
  };
  gallery: {
    subtitle: string;
    title: string;
    view: string;
    back: string;
    empty: string;
  };
  packages: {
    subtitle: string;
    title: string;
    popular: string;
    cta: string;
  };
  testimonials: {
    subtitle: string;
    title: string;
  };
  contact: {
    subtitle: string;
    title: string;
    name: string;
    email: string;
    phone: string;
    event_date: string;
    message: string;
    send: string;
    sending: string;
    success_title: string;
    success_message: string;
    error_title: string;
    error_message: string;
    info_title: string;
    address: string;
    social: string;
  };
  footer: {
    rights: string;
    crafted: string;
  };
}

const translations: Record<Language, Translations> = {
  sr: {
    nav: {
      about: "O meni",
      gallery: "Galerija",
      packages: "Paketi",
      testimonials: "Recenzije",
      contact: "Kontakt",
    },
    hero: {
      cta_primary: "Rezervišite Termin",
      cta_secondary: "Pogledaj Galeriju",
    },
    about: {
      subtitle: "Dobrodošli",
    },
    gallery: {
      subtitle: "Moj rad",
      title: "Galerija",
      view: "Pogledaj galeriju",
      back: "Nazad na galeriju",
      empty: "Trenutno nema galerija.",
    },
    packages: {
      subtitle: "Ponuda",
      title: "Fotografski Paketi",
      popular: "Najpopularniji",
      cta: "Kontaktirajte nas",
    },
    testimonials: {
      subtitle: "Utisci",
      title: "Šta kažu naši klijenti",
    },
    contact: {
      subtitle: "Javite nam se",
      title: "Kontaktirajte nas",
      name: "Ime i prezime",
      email: "Email adresa",
      phone: "Telefon (opciono)",
      event_date: "Datum vjenčanja (opciono)",
      message: "Vaša poruka",
      send: "Pošaljite poruku",
      sending: "Šaljem...",
      success_title: "Poruka uspješno poslana! ✨",
      success_message: "Hvala vam na poruci! Javićemo vam se u najkraćem mogućem roku.",
      error_title: "Greška pri slanju poruke",
      error_message: "Molimo pokušajte ponovo ili nas kontaktirajte direktno.",
      info_title: "Kontakt informacije",
      address: "Adresa",
      social: "Pratite nas",
    },
    footer: {
      rights: "Sva prava zadržana.",
      crafted: "Kreirao sa",
    },
  },
  en: {
    nav: {
      about: "About",
      gallery: "Gallery",
      packages: "Packages",
      testimonials: "Reviews",
      contact: "Contact",
    },
    hero: {
      cta_primary: "Book Now",
      cta_secondary: "View Gallery",
    },
    about: {
      subtitle: "Welcome",
    },
    gallery: {
      subtitle: "My Work",
      title: "Gallery",
      view: "View gallery",
      back: "Back to gallery",
      empty: "No galleries available.",
    },
    packages: {
      subtitle: "Offer",
      title: "Photography Packages",
      popular: "Most Popular",
      cta: "Contact us",
    },
    testimonials: {
      subtitle: "Reviews",
      title: "What Our Clients Say",
    },
    contact: {
      subtitle: "Get in Touch",
      title: "Contact Us",
      name: "Full Name",
      email: "Email Address",
      phone: "Phone (optional)",
      event_date: "Wedding Date (optional)",
      message: "Your Message",
      send: "Send Message",
      sending: "Sending...",
      success_title: "Message Sent Successfully! ✨",
      success_message: "Thank you for your message! We will get back to you as soon as possible.",
      error_title: "Error Sending Message",
      error_message: "Please try again or contact us directly.",
      info_title: "Contact Information",
      address: "Address",
      social: "Follow Us",
    },
    footer: {
      rights: "All rights reserved.",
      crafted: "Crafted with",
    },
  },
  de: {
    nav: {
      about: "Über mich",
      gallery: "Galerie",
      packages: "Pakete",
      testimonials: "Bewertungen",
      contact: "Kontakt",
    },
    hero: {
      cta_primary: "Termin Buchen",
      cta_secondary: "Galerie Ansehen",
    },
    about: {
      subtitle: "Willkommen",
    },
    gallery: {
      subtitle: "Meine Arbeit",
      title: "Galerie",
      view: "Galerie ansehen",
      back: "Zurück zur Galerie",
      empty: "Keine Galerien verfügbar.",
    },
    packages: {
      subtitle: "Angebot",
      title: "Fotografie-Pakete",
      popular: "Beliebteste",
      cta: "Kontaktieren Sie uns",
    },
    testimonials: {
      subtitle: "Bewertungen",
      title: "Was unsere Kunden sagen",
    },
    contact: {
      subtitle: "Kontaktieren Sie uns",
      title: "Kontakt",
      name: "Vollständiger Name",
      email: "E-Mail-Adresse",
      phone: "Telefon (optional)",
      event_date: "Hochzeitsdatum (optional)",
      message: "Ihre Nachricht",
      send: "Nachricht senden",
      sending: "Wird gesendet...",
      success_title: "Nachricht erfolgreich gesendet! ✨",
      success_message: "Vielen Dank für Ihre Nachricht! Wir werden uns so schnell wie möglich bei Ihnen melden.",
      error_title: "Fehler beim Senden der Nachricht",
      error_message: "Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt.",
      info_title: "Kontaktinformationen",
      address: "Adresse",
      social: "Folgen Sie uns",
    },
    footer: {
      rights: "Alle Rechte vorbehalten.",
      crafted: "Erstellt mit",
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved as Language) || "sr";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
