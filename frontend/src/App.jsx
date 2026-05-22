import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar   from "./components/Navbar";
import Login    from "./pages/Login";
import Register from "./pages/Register";
import Feed     from "./pages/Feed";

const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { token } = useAuth();
  return !token ? children : <Navigate to="/feed" replace />;
};

// We wrap the routes and navbar in a sub-component to access useAuth
const AppContent = () => {
  const { token } = useAuth();
  return (
    <>
      {token && <Navbar />} 
      <Routes>
        <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/feed"     element={<PrivateRoute><Feed /></PrivateRoute>} />
        <Route path="*"         element={<Navigate to="/feed" replace />} />
      </Routes>
    </>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}