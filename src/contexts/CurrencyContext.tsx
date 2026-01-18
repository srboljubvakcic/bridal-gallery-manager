import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

type Currency = "KM" | "EUR";

// Fixed exchange rate: 1 EUR = 1.95583 KM
const KM_TO_EUR_RATE = 1.95583;

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (priceInKM: number) => string;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<Currency>("KM");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectLocation = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('detect-location');
        
        if (error) {
          console.error("Error detecting location:", error);
          setCurrency("EUR"); // Default to EUR on error
        } else if (data?.currency) {
          setCurrency(data.currency as Currency);
          console.log("Detected currency:", data.currency, "Country:", data.country);
        }
      } catch (error) {
        console.error("Error calling detect-location:", error);
        setCurrency("EUR"); // Default to EUR on error
      } finally {
        setIsLoading(false);
      }
    };

    detectLocation();
  }, []);

  const formatPrice = (priceInKM: number): string => {
    if (currency === "KM") {
      return `${priceInKM.toLocaleString("bs-BA")} KM`;
    } else {
      // Convert KM to EUR
      const priceInEUR = priceInKM / KM_TO_EUR_RATE;
      return `€${priceInEUR.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};
