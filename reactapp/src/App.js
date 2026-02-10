import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from "./api/hooks/AuthContext";
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import AdminStats from './pages/AdminStats';
import MyPostsPage from './pages/MyPostsPage';
import CreatePostPage from './pages/CreatePostPage';
import Navbar from './components/Navbar';
import GoogleAuthFinish from './pages/GoogleAuthFinish';
import { useAuth } from "./api/hooks/AuthContext";
import PostDetails from './pages/PostDetails';
import ChatWidget from "./components/ChatWidget";


function AppRoutes() {
  const { user } = useAuth();
  const [chatOpen, setChatOpen] = useState(false);
  
  const roleId = user?.role_id || user?.role?.id || null;
  const isLoggedIn = !!user;

  return (
    <>
      <Navbar />
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/post/:id" element={<PostDetails />} />
          <Route path="/auth/callback" element={<GoogleAuthFinish />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {isLoggedIn ? (
            <>
              {roleId == 1 && (
                <Route path="/statistika" element={<AdminStats />} />
              )}
              {(roleId == 1 || roleId == 2) && (
                <>
                  <Route path="/create" element={<CreatePostPage />} />
                  <Route path="/posts" element={<MyPostsPage />} />
                </>
              )}
            </>
          ) : (
            <>
              {/* login/register already defined above so we keep only guest-only routes here if needed */}
            </>
          )}
        </Routes>
      </div>
      
      {/* AI Chat Widget - vidljiv samo za ulogovane korisnike */}
      {isLoggedIn && (
        <ChatWidget 
          apiBaseUrl={import.meta.env.VITE_API_BASE_URL || ""} 
          isOpen={chatOpen}
          onOpenChange={setChatOpen}
        />
      )}
    </>
  );
}

function AppContent() {
  const { user } = useAuth();
  const [chatOpen, setChatOpen] = useState(false);

  // Close chat when user logs out
  React.useEffect(() => {
    if (!user) {
      setChatOpen(false);
    }
  }, [user]);

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
