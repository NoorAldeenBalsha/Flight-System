import React, { createContext, useState, useContext } from "react";
import { languages,defaultlang } from "../i18n";
import Cookies from "js-cookie"; 

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  
  const [lang, setLang] = useState(() => Cookies.get("lang") || defaultlang);
  
  
  const t=languages[lang];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);