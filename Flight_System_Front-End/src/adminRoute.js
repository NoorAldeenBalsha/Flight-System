import { Navigate } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "./context/auth/authContext";


export default function AdminRoute({ children }) {
  const { user, isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) return <Navigate to="/" replace />;

  if (user.role !== "admin") return <Navigate to="/" replace />;

  return children;
}