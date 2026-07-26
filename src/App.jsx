import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import About from "./pages/About";
import Fixtures from "./pages/Fixtures";
import News from "./components/News";
import Contact from "./pages/Contact";

import Login from "./components/Login";
import Registration from "./components/Registration";

import TitansFanzoneDashboard from "./components/TitansFanzoneDashboard";
import TitansAdminDashboard from "./components/TitansAdminDashboard";

import AuthProvider from "./components/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />

          <main className="flex-1">
            <Routes>
              {/* Public Pages */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/fixtures" element={<Fixtures />} />
              <Route path="/news" element={<News />} />
              <Route path="/contact" element={<Contact />} />

              {/* Authentication */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Registration />} />

              {/* Fan Dashboard */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <TitansFanzoneDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin Dashboard */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <TitansAdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>

          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}