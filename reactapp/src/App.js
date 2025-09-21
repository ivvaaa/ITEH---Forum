import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from "./api/hooks/AuthContext";
import HomePage from './pages/HomePage';
import Register from './pages/RegisterPage';
import Login from './pages/LoginPage';
import CreatePostPage from './pages/CreatePostPage';
import AdminStats from './pages/AdminStats';
import MyPostsPage from './pages/MyPostsPage';
import Navbar from './components/Navbar';
import { useAuth } from "./api/hooks/AuthContext";
import PostDetails from './pages/PostDetails';


function AppRoutes() {
  const { user } = useAuth();
  const roleId = user?.role_id || user?.role?.id || null;
  const isLoggedIn = !!user;
  console.log("isLoggedIn:", isLoggedIn, "roleId:", roleId);

  return (
    <>
      <Navbar />
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/post/:id" element={<PostDetails />} />
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
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
            </>
          )}
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;