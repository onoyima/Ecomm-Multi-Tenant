import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type CurrencyCode = "NGN" | "USD" | "GBP" | "EUR";

interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rate: number;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  NGN: { code: "NGN", symbol: "₦", name: "Nigerian Naira", rate: 1 },
  USD: { code: "USD", symbol: "$", name: "US Dollar", rate: 0.00065 },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", rate: 0.00052 },
  EUR: { code: "EUR", symbol: "€", name: "Euro", rate: 0.00060 },
};

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  info: CurrencyInfo;
  format: (amountInNgn: number) => string;
  convert: (amountInNgn: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("NGN");

  useEffect(() => {
    AsyncStorage.getItem("@currency").then((stored) => {
      if (stored && (stored in CURRENCIES)) {
        setCurrencyState(stored as CurrencyCode);
      }
    });
  }, []);

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code);
    AsyncStorage.setItem("@currency", code);
  };

  const info = CURRENCIES[currency];
  const convert = (amountInNgn: number) => Math.round(amountInNgn * info.rate * 100) / 100;
  const format = (amountInNgn: number) => {
    const converted = convert(amountInNgn);
    if (currency === "NGN") {
      return "₦" + Math.round(converted).toLocaleString("en-NG");
    }
    return info.symbol + converted.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, info, format, convert }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
