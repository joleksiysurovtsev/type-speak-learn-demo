import { Button } from "@/components/ui/button";
import type { Language } from "@/lib/types";

interface LanguageSelectorProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

export const LanguageSelector = ({ currentLanguage, onLanguageChange }: LanguageSelectorProps) => {
  const languages: { code: Language; name: string; flag: string }[] = [
    { code: "uk", name: "Українська", flag: "🇺🇦" },
    { code: "ru", name: "Русский", flag: "🇷🇺" },
    { code: "pl", name: "Polski", flag: "🇵🇱" },
    { code: "en", name: "English", flag: "🇺🇸" },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">Language / Мова</h3>
      <div className="grid grid-cols-1 gap-2">
        {languages.map((language) => (
          <Button
            key={language.code}
            variant={currentLanguage === language.code ? "default" : "outline"}
            onClick={() => onLanguageChange(language.code)}
            className={`justify-start h-12 text-left transition-all duration-200 ${
              currentLanguage === language.code 
                ? "shadow-interactive scale-105" 
                : "hover:shadow-gentle hover:scale-102"
            }`}
          >
            <span className="text-2xl mr-3">{language.flag}</span>
            <span className="font-medium">{language.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};