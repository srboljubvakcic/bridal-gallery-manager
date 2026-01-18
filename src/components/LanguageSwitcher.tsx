import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  isScrolled?: boolean;
}

export const LanguageSwitcher = ({ isScrolled = false }: LanguageSwitcherProps) => {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: "sr" as const, label: "SR" },
    { code: "en" as const, label: "EN" },
    { code: "de" as const, label: "DE" },
  ];

  return (
    <div className="flex items-center gap-1">
      {languages.map((lang, index) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={cn(
            "px-2 py-1 text-xs font-medium uppercase tracking-wider transition-all duration-200 rounded",
            language === lang.code
              ? isScrolled
                ? "bg-primary text-primary-foreground"
                : "bg-cream text-charcoal"
              : isScrolled
                ? "text-foreground/70 hover:text-foreground hover:bg-muted"
                : "text-cream/70 hover:text-cream hover:bg-cream/20"
          )}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};
