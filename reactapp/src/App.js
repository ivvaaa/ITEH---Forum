import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import Register from './pages/RegisterPage';
import Login from './pages/LoginPage';
import Navbar from './components/Navbar';
// import PostsList from './pages/Post/PostsList';
// import PostDetails from './pages/Post/PostDetails';
// import Moderator from './pages/Moderator/Moderator';
// import Admin from './pages/Admin/Admin';
// import AdminStatistike from './pages/Admin/AdminStatistike';
import PostDetails from './pages/PostDetails';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [roleId, setRoleId] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem('auth_token');
    const role_id = sessionStorage.getItem('role_id');
    if (token) {
      setIsLoggedIn(true);
      setRoleId(parseInt(role_id));  // Pretvori u broj radi sigurnosti
    }
  }, []);

  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} roleId={roleId} />
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/post/:id" element={<PostDetails />} />

          {isLoggedIn ? (
            <>
              {/* {roleId == 1 && (
                <>
                  <Route path="/posts" element={<PostsList />} />
                  <Route path="/post/:id" element={<PostDetails />} />
                </>
              )} */}
              {/* {roleId == 2 && (
                <>
                  <Route path="/moderator" element={<Moderator />} />
                </>
              )}
              {roleId == 3 && (
                <>
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/adminStatistike" element={<AdminStatistike />} />
                </>
              )} */}
            </>
          ) : (
            <>
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
