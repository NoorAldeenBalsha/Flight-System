import { useContext ,useEffect,useRef,useState} from "react";
import { ThemeContext } from "../context/theme/themeContext";
import { useLanguage } from "../context/LanguageContext";
import "../css/themeSwitcher.css";

function ThemeSwitcher() {
  const { theme, setTheme } = useContext(ThemeContext);
  const { lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options = [
    { id: "light", label: lang === "ar" ? "فاتح" : "Light", icon: "☀️" },
    { id: "dark", label: lang === "ar" ? "داكن" : "Dark", icon: "🌙" },
    { id: "system", label: lang === "ar" ? "حسب النظام" : "System", icon: "💻" },
  ];

  return (
    <div
      className={`theme-dropdown ${lang === "ar" ? "rtl" : "ltr"}`}
      ref={ref}
    >
      <button
        className="theme-trigger"
        onClick={() => setOpen(!open)}
        aria-label="Theme"
      >
        🌗
      </button>

      {open && (
        <div className="theme-menu">
          {options.map((opt) => (
            <button
              key={opt.id}
              className={`theme-item ${theme === opt.id ? "active" : ""}`}
              onClick={() => {
                setTheme(opt.id);
                setOpen(false);
              }}
            >
              <span className="icon">{opt.icon}</span>
              <span className="label">{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
export default ThemeSwitcher;
