import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLanguage } from "../context/LanguageContext";
import i18nIsoCountries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import "../css/profile.css";
import 'react-phone-input-2/lib/style.css';
import PhoneInput from "react-phone-input-2";
import loadingGif from "../images/Spinner.gif"

const Profile = () => {
  const [user, setUser] = useState(null);
  const { lang, setLang, t } = useLanguage();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const token = localStorage.getItem("accessToken");
  const [uploading, setUploading] = useState(false);
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
     
        const res = await axios.get(
          "http://localhost:5000/api/user/current-user",
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
    
    const gender=formData.gender.toLowerCase();
    try {
      const userId = formData.userId;
      const {_id,userId:_,role,gender,lastLogin,...cleanData}=formData;
      if (!userId) throw new Error("User ID not found!");
      await axios.patch(
        `http://localhost:5000/api/user/update/${userId}`,
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
    const token = localStorage.getItem("accessToken");
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

      const response = await axios.post(
        "http://localhost:5000/api/upload/chunk",
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
      await axios.patch(
        `http://localhost:5000/api/user/update/${formData.userId}`,
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

    alert(" Image uploaded successfully!");
  } catch (error) {
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
      <p> {t("loading_data")}</p>
    </div>
  //=======================================================================================================
  return (
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
                <label>{t("full_name") || "Full Name"}</label>
                <input type="text" name="fullName" value={formData.fullName || ""} onChange={handleChange} />
                <label>{t("email") || "Email"}</label>
                <input type="email" name="email" value={formData.email || ""} onChange={handleChange} />
                <label>{t("phone") || "Phone"}</label>
                <PhoneInput
                  country={"sy"}
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  enableSearch={true}
                  preferredCountries={["sy", "sa", "ae", "eg", "lb", "tr"]}
                  placeholder={lang === "ar" ? "أدخل رقم هاتفك" : "Enter your phone"}
                  inputClass={lang === "ar" ? "rtl" : ""}
                  containerClass={lang === "ar" ? "rtl" : ""}
                  inputStyle={{ width: "100%"}}
                />
                <label>{t("dateOfBirth") || "Date of Birth"}</label>
               <input type="date" name="dateOfBirth" value={formData.dateOfBirth || ""} onChange={handleChange} />
                <label>{t("birth_Country") || "Birth Country"}</label>
                <select name="birthCountry" value={formData.birthCountry || ""} onChange={handleChange}>
                <option value="other">
                  {t("select_birth_Country") || "Select Birth Country"}
                </option>
                {countryOptions.map(([code, name]) => (
                  <option key={code} value={name}>
                    {name}
                  </option>
                ))}
                </select>
                <label>{t("residence_Country") || "Residence Country"}</label>
                <select name="residenceCountry" value={formData.residenceCountry || ""} onChange={handleChange}>
                <option value="other">
                  {t("select_residence_Country") || "Select Residence Country"}
                </option>
                {countryOptions.map(([e, name]) => (
                  <option key={e} value={name}>
                    {name}
                  </option>
                ))}
              </select>
                <label>{t("select_gender") || "Select Gender"}</label>
                <select name="gender" value={formData.gender || "other"} onChange={handleChange}>
                  <option value="other">{t("other") || "Other"}</option>
                  <option value="male">{t("male") || "Male"}</option>
                  <option value="female">{t("female") || "Female"}</option>
                </select>
                <label>{t("passport_number") || "Passport Number"}</label>
                <input type="text" name="passportNumber" value={formData.passportNumber || ""} onChange={handleChange} />
                <label>{t("bio") || "Bio"}</label>
                <textarea name="bio" value={formData.bio || ""} onChange={handleChange} />
              </>
            ) : (
              <>
                <p><strong>{t("email") || "Email"}:</strong> {user.email || "N/A"}</p>
                <p><strong>{t("phone") || "Phone"}:</strong> {user.phone || "N/A"}</p>
                <p><strong>{t("dateOfBirth") || "Date of birth"}:</strong> {new Date(user.dateOfBirth).toLocaleDateString() || "N/A"}</p>
                <p><strong>{t("birth_Country") || "Birth Country"}:</strong> {user.birthCountry || "N/A"}</p>
                <p><strong>{t("residence_Country") || "Residence Country"}:</strong> {user.residenceCountry || "N/A"}</p>
                <p><strong>{t("gender") || "Gender"}:</strong> {user.gender || "N/A"}</p>
                <p><strong>{t("passport_number") || "Passport Number"}:</strong> {user.passportNumber || "N/A"}</p>
              </>
            )}
            </div>
          </div>

          <div className="profile-actions">
            {/*Buttons Edit mode*/}
            {editMode ? (
              <button className="save-btn" onClick={handleSave}> {t("save") || "Save"}</button>
            ) : (
              <button className="edit-btn" onClick={() => setEditMode(true)}> {t("edit") || "Edit"}</button>
            )}
            <button className="password-btn" onClick={() => (window.location.href = "/forget")}> {t("reset_password") || " Reset Password"}</button>
          </div>
        </div>
      </div>
    </div>
  );
};
  //=======================================================================================================
export default Profile;