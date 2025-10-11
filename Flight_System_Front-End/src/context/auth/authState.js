import React, { useReducer } from "react";
import AuthContext from "./authContext";
import AuthReducer from "./authReducer";
import axios from "axios";

const AuthState = (props) => {
  const initialState = {
    isAuthenticated: false,
    user: null,
    loading: false,
    errors: [],
    current: 0,
    verified: false,
    displayVerified: false,
    isAccountVerified: false,
  };

  const [state, dispatch] = useReducer(AuthReducer, initialState);

  // تسجيل مستخدم جديد
const register = async (formData) => {
  const config = { headers: { "Content-Type": "application/json" } };
  try {
    const res = await axios.post("http://localhost:5000/api/user/auth/register", formData, config);

    // dispatch النجاح
    dispatch({type: "REGISTER_SUCCESS", payload: { ...res.data, isAccountVerified: res.data.isAccountVerified || false }});

    // إرجاع الرسالة للـ Auth.js
    return res.data;

    } catch (err) {
 const errorData = err.response?.data || { message: "Unknown error" };
    dispatch({ type: "REGISTER_FAIL", payload: errorData });
    throw err; // ✅ رجّع الخطأ للواجهة
    }
};

  // تسجيل الدخول
  const login = async (formData) => {
    const config = { headers: { "Content-Type": "application/json" } };
    try {
      const res = await axios.post("http://localhost:5000/api/user/auth/login",formData,config);

      localStorage.setItem("token", res.data.token);
      dispatch({ type: "LOGIN_SUCCESS", payload: res.data });

      return res.data; // ✅ رجّع البيانات بالنجاح
    } catch (err) {
 const errorData = err.response?.data || { message: "Unknown error" };
    dispatch({ type: "REGISTER_FAIL", payload: errorData });
    throw err; // ✅ رجّع الخطأ للواجهة
    }
  };

  // تسجيل الخروج
  const logout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/user/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    } catch (err) {
      console.error(err.response?.data || err.message);
    } finally {
      localStorage.removeItem("token");
      dispatch({ type: "LOGOUT" });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        register,
        login,
        logout,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        loading: state.loading,
        errors: state.errors,
        current: state.current,
        verified: state.verified,
        displayVerified: state.displayVerified,
        isAccountVerified: state.isAccountVerified,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthState;