import LandingPage from "./components/LandingPage";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Settings from "./components/Settings";
import AddTaskMobile from "./components/AddTaskMobile";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import VerifyAccount from "./components/VerifyAccount";
import { useAuth } from "./components/AuthContext";
import { Toaster } from "react-hot-toast";
import Privacy from "./components/Privacy";
import Terms from "./components/Terms";

function App() {
  const { user, loading } = useAuth();
  return (
    <>
      <BrowserRouter>
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            style: {
              background: '#1a1a1a', /* Tere card background se match karta hua */
              color: '#f1f5f9',
              border: '1px solid #1c1830',
              borderRadius: '12px',
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              padding: '12px 18px',
            },
            duration: 2000,
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981', /* Mint Emerald Green Match */
                secondary: '#06050a',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444', /* Soft Crimson Red Match */
                secondary: '#06050a',
              },
            },
          }}
        />
        <Routes>
          <Route path="/" element={
            loading ? <div className="loading">Checking...</div> :
              user ? <Navigate to="/dashboard" replace /> : <LandingPage />
          } />
          <Route path="/register" element={
            loading ? <div className="loading">Checking...</div> :
              user ? <Navigate to="/dashboard" replace /> : <Signup />
          } />
          <Route path="/login" element={
            loading ? <div className="loading">Checking...</div> :
              user ? <Navigate to="/dashboard" replace /> : <Login />
          } />
          <Route path="/verify-account" element={<VerifyAccount />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/add-task" element={
            <ProtectedRoute>
              <AddTaskMobile />
            </ProtectedRoute>
          } />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;