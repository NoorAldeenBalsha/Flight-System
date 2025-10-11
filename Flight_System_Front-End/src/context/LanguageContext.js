import React, { createContext, useState, useContext, useEffect } from "react";
import translations from "../i18n/translations";
import Cookies from "js-cookie"; // تحتاج تثبيت مكتبة js-cookie

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // قراءة اللغة من الكوكيز أو افتراضيًا "en"
  const [lang, setLang] = useState(() => Cookies.get("lang") || "en");

  // تغيير اللغة وحفظها بالكوكيز
  const changeLang = (newLang) => {
    setLang(newLang);
    Cookies.set("lang", newLang, { expires: 365 }); // الصلاحية سنة كاملة
  };

  const t = (key) => translations[lang][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);