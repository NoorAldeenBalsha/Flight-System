import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  
  const [uploading, setUploading] = useState(false);
  const CHUNK_SIZE = 1024 * 1024; 

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("accessToken");
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      const userId = formData.userId;
      const {_id,userId:_,role,lastLogin,...cleanData}=formData;
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

      // إذا الباك رجع secure_url (آخر chunk)
      if (response.data.secure_url) {
        uploadedFileUrl = response.data.secure_url;
      }
    }

    // بعد اكتمال الرفع، حدث الـ user profile
    if (uploadedFileUrl) {
      await axios.patch(
        `http://localhost:5000/api/user/update/${formData.userId}`,
        {
          [type]: uploadedFileUrl, // type ممكن يكون "profilePicture" أو "coverPhoto"
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    }

    alert("✅ Image uploaded successfully!");
  } catch (error) {
    console.error("❌ Error uploading image:", error.response?.data || error);
  } finally {
    setUploading(false);
  }
};

  if (!user) return <p className="loading-text">Loading...</p>;

  return (
    <div className="profile-container">
      {/* Background Clouds */}
      <div className="cloud-background"></div>

      {/* Plane */}
      <div className="plane"></div>

      {/* Profile Card */}
      <div className="profile-card">
        <div
          className="profile-cover"
          style={{
            backgroundImage: user.coverPicture
              ? `url(${user.coverPicture})`
              : `linear-gradient(to right, #87ceeb, #b0e0e6)`,
          }}
        />
        <label className="edit-icon cover-edit">
          <i className="fas fa-pen"></i>
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => handleFileChange(e, "coverPicture")}
          />
        </label>
        <div className="profile-avatar-container">
          {user.picture ? (
            <img src={`${user.picture}`} alt="Profile" className="profile-avatar" />
          ) : (
            <div className="avatar-placeholder">No Image</div>
          )}
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

        <div className="profile-info">
          <h2>{user.fullName || "N/A"}</h2>
          <p className="about-me">{user.bio || "About me..."}</p><div className="profile-details">
            {editMode ? (
              <>
                <label>Full Name</label>
                <input type="text" name="fullName" value={formData.fullName || ""} onChange={handleChange} />
                <label>Email</label>
                <input type="email" name="email" value={formData.email || ""} onChange={handleChange} />
                <label>Phone</label>
                <input type="text" name="phone" value={formData.phone || ""} onChange={handleChange} />
                <label>Birth Country</label>
                <input type="text" name="birthCountry" value={formData.birthCountry || ""} onChange={handleChange} />
                <label>Residence Country</label>
                <input type="text" name="residenceCountry" value={formData.residenceCountry || ""} onChange={handleChange} />
                <label>Gender</label>
                <select name="gender" value={formData.gender || ""} onChange={handleChange}>
                  <option value="other">Other</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <label>Passport Number</label>
                <input type="text" name="passportNumber" value={formData.passportNumber || ""} onChange={handleChange} />
                <label>Bio</label>
                <textarea name="bio" value={formData.bio || ""} onChange={handleChange} />
              </>
            ) : (
              <>
                <p><strong>Email:</strong> {user.email || "N/A"}</p>
                <p><strong>Phone:</strong> {user.phone || "N/A"}</p>
                <p><strong>Birth Country:</strong> {user.birthCountry || "N/A"}</p>
                <p><strong>Residence Country:</strong> {user.residenceCountry || "N/A"}</p>
                <p><strong>Gender:</strong> {user.gender || "N/A"}</p>
                <p><strong>Passport Number:</strong> {user.passportNumber || "N/A"}</p>
              </>
            )}
          </div>

          <div className="profile-actions">
            {editMode ? (
              <button className="save-btn" onClick={handleSave}> Save</button>
            ) : (
              <button className="edit-btn" onClick={() => setEditMode(true)}> Edit</button>
            )}
            <button className="password-btn" onClick={() => (window.location.href = "/forget")}> Change Password</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;