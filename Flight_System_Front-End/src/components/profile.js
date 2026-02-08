import React, { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import i18nIsoCountries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import "../css/profile.css";
import 'react-phone-input-2/lib/style.css';
import PhoneInput from "react-phone-input-2";
import loadingGif from "../images/Rocket.gif"
import Toast from "./ToastAnimated";
import API from "../services/api";

const Profile = () => {
  const [user, setUser] = useState(null);
  const { lang, t } = useLanguage();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const token = localStorage.getItem("accessToken");
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const CHUNK_SIZE = 1024 * 1024; 
  const defaultImage ="https://cdn-icons-png.flaticon.com/512/847/847969.png";
  //=======================================================================================================
  //This one for list of all countries in arbic or english
  i18nIsoCountries.registerLocale(enLocale);
  const countryList =i18nIsoCountries.getNames("en");
  const countryOptions = Object.entries(countryList);
  //=======================================================================================================
  // Fetch the current user data when the component mounts
  useEffect(() => {
    const fetchUser = async () => {
      try {
     
        const res = await API.get(
          "/user/current-user",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUser(res.data);
        setFormData({
          ...res.data,
          userId: res.data._id, 
        });
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, []);
  //=======================================================================================================
  // Handle input changes in the form fields
  const handleChange = (e) => {setFormData({ ...formData, [e.target.name]: e.target.value });};
  //=======================================================================================================
  // Save the updated user information
  const handleSave = async () => {
    try {
      const userId = formData.userId;
      const {_id,userId:_,role,gender,lastLogin,...cleanData}=formData;
      if (!userId) throw new Error("User ID not found!");
      await API.patch(
        `/user/update/${userId}`,
        cleanData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUser(formData);
      setEditMode(false);
    } catch (err) {
      console.error("Error saving user:", err);
    }
  };
  //=======================================================================================================
  // Handle image upload (profile or cover picture)
  const handleFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      const uploadId = Date.now().toString();
      let uploadedFileUrl = "";

      // رفع جميع chunks
      for (let chunkNumber = 0; chunkNumber < totalChunks; chunkNumber++) {
        const start = chunkNumber * CHUNK_SIZE;
        const end = Math.min(file.size, (chunkNumber + 1) * CHUNK_SIZE);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append("files", chunk, file.name);
        formData.append("fileName", file.name);
        formData.append("chunkNumber", chunkNumber.toString());
        formData.append("totalChunks", totalChunks.toString());
        formData.append("uploadId", uploadId);

        const response = await API.post(
          "/upload/chunk",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        
        if (response.data.secure_url) {
          uploadedFileUrl = response.data.secure_url;
        }
      }

      
      if (uploadedFileUrl) {
        await API.patch(
          `/user/update/${formData.userId}`,
          {
            [type]: uploadedFileUrl, 
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
      setToast({ show: true, message:t.Image_uploaded_successfully , type: "success" });
    } catch (error) {
      setToast({ show: true, message:t.dash_error_deleting_user , type: "error" });
      console.error(" Error uploading image:", error.response?.data || error);
    } finally {
      setUploading(false);
    }
  };
  //=======================================================================================================
  // Handle Phone change
  const handlePhoneChange = (value) => {
    setFormData((prev) => ({ ...prev, phone: value }));
  };
  //=======================================================================================================
  if (!user) return   <div className="loading-container">
      <img src={loadingGif} alt="Loading..." className="loading-gif" />
      <p> {t.loading_data}</p>
    </div>
  //=======================================================================================================
  return (
    <>
    {toast.show && ( <Toast 
            show={toast.show}message={toast.message}type={toast.type}onClose={() => setToast({ ...toast, show: false })}/>)}
      <div
    className="profile-container">
      {/* Background Clouds */}
      <div className="cloud-background"></div>

      {/* Plane */}
      <div className="plane1"></div>
      <div className="plane2"></div>
      <div className="plane3"></div>
      <div className="plane4"></div>


      {/* Profile Card */}
      <div className="profile-card">
        {/* Cover Picture */}
        <div>
        <div className="profile-cover" style={{
            backgroundImage: user.coverPicture
              ? `url(${user.coverPicture})`
              : `linear-gradient(to right, #87ceeb, #b0e0e6)`,
          }}
        />
        {/*Edit Cover Picture */}
        <label className="edit-icon cover-edit">
          <i className="fas fa-pen"></i>
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => handleFileChange(e, "coverPicture")}
          />
        </label>
        </div>
        
        {/* Profile Picture */}
        <div className="profile-avatar-container">
          <img src={user?.picture || defaultImage} alt="Profile" className="profile-avatar"/>

          <label className="edit-icon avatar-edit">
          <i className="fas fa-pen"></i>
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => handleFileChange(e, "picture")}
          />
        </label>
        </div>

        {/* Profile Details */}
        <div className="profile-info">
          {/* Full Name & Bio in Top of profile card */}
          <h2>{user.fullName || "N/A"}</h2>
          <p className="about-me">{user.bio || "About me..."}</p><div className="profile-details">
            <div className="profile-info2" dir={lang === "ar" ? "rtl" : "ltr"}
                style={{ direction: lang === "ar" ? "rtl" : "ltr", textAlign: lang === "ar" ? "right" : "left",}}>
            {/* Edit mode for change information  */}
            {editMode ? (
              <>
                <label>{t.full_name}</label>
                <input type="text" name="fullName" value={formData.fullName || ""} onChange={handleChange} />
                <label>{t.email }</label>
                <input type="email" name="email" value={formData.email || ""} onChange={handleChange} />
                <label>{t.phone }</label>
                <PhoneInput
                  country={"sy"}
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  enableSearch={true}
                  preferredCountries={["sy", "sa", "ae", "eg", "lb", "tr"]}
                  placeholder={lang === "en" ? "أدخل رقم هاتفك" : "Enter your phone"}
                  containerClass={lang === "ar" ? "phone-rtl" : ""}
                  inputStyle={{ width: "100%"}}
                />
                <label>{t.dateOfBirth}</label>
               <input type="date" name="dateOfBirth" value={formData.dateOfBirth || ""} onChange={handleChange} />
                <label>{t.birth_Country}</label>
                <select name="birthCountry" value={formData.birthCountry || ""} onChange={handleChange}>
                <option value="other">
                  {t.select_birth_Country}
                </option>
                {countryOptions.map(([code, name]) => (
                  <option key={code} value={name}>
                    {name}
                  </option>
                ))}
                </select>
                <label>{t.residence_Country}</label>
                <select name="residenceCountry" value={formData.residenceCountry || ""} onChange={handleChange}>
                <option value="other">
                  {t.select_residence_Country}
                </option>
                {countryOptions.map(([e, name]) => (
                  <option key={e} value={name}>
                    {name}
                  </option>
                ))}
              </select>
                <label>{t.select_gender}</label>
                <select name="gender" value={formData.gender || "other"} onChange={handleChange}>
                  <option value="other">{t.other}</option>
                  <option value="male">{t.male}</option>
                  <option value="female">{t.female}</option>
                </select>
                <label>{t.passport_number}</label>
                <input type="text" name="passportNumber" value={formData.passportNumber || ""} onChange={handleChange} />
                <label>{t.bio}</label>
                <textarea name="bio" value={formData.bio || ""} onChange={handleChange} />
              </>
            ) : (
              <>
                <p><strong>{t.email}:</strong> {user.email || "N/A"}</p>
                <p><strong>{t.phone}:</strong> {user.phone || "N/A"}</p>
                <p><strong>{t.dateOfBirth}:</strong> {new Date(user.dateOfBirth).toLocaleDateString() || "N/A"}</p>
                <p><strong>{t.birth_Country}:</strong> {user.birthCountry || "N/A"}</p>
                <p><strong>{t.residence_Country}:</strong> {user.residenceCountry || "N/A"}</p>
                <p><strong>{t.gender}:</strong> {user.gender || "N/A"}</p>
                <p><strong>{t.passport_number}:</strong> {user.passportNumber || "N/A"}</p>
              </>
            )}
            </div>
          </div>

          <div className="profile-actions">
            {/*Buttons Edit mode*/}
            {editMode ? (
              <button className="save-btn-profile" onClick={handleSave}> {t.save}</button>
            ) : (
              <button className="edit-btn-profile" onClick={() => setEditMode(true)}> {t.edit}</button>
            )}
            <button className="password-btn" onClick={() => (window.location.href = "/forget")}> {t.reset_password}</button>
          </div>
        </div>
      </div>
    </div>
    </>
  
  );
};
  //=======================================================================================================
export default Profile;