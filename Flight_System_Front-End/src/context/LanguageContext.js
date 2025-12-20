import React, { createContext, useState, useContext, useEffect } from "react";
import translations from "../i18n/translations";
import Cookies from "js-cookie"; 

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  
  const [lang, setLang] = useState(() => Cookies.get("lang") || "en");

  
  const changeLang = (newLang) => {
    setLang(newLang);
    Cookies.set("lang", newLang, { expires: 365 }); 
  };

  const t = (key) => translations[lang][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);