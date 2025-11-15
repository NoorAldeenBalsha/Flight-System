import { useNavigate } from "react-router-dom";
import "../css/fail.css"
import icon from '../images/close.png'
import { useLanguage } from "../context/LanguageContext";
const Fail = () => {
  const history = useNavigate();
  const { t, lang } = useLanguage()
  //=======================================================================================================
  return (
    <div className="failure-page">
      <div className="failure-content">
        <img src={icon}alt="Failure Animation"className="failure-gif"/>
        <h1>{t("fail_title")} </h1>
        <p>
          {t("fail_sub")}
          <br />
          {t("fail_sub2")}
        </p>

        <button className="retry-button" onClick={()=> history("/")}>
          {t("go_back_home")}
        </button>
      </div>
    </div>
  );
}
export default Fail;
