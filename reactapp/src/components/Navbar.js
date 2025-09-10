import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
//import './Navbar.css';  

const Navbar = ({ isLoggedIn, setIsLoggedIn, roleId }) => {
  let navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('http://127.0.0.1:8000/api/logout', {}, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
        }
      });

      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('role_id');
      setIsLoggedIn(false);
      navigate("/");
    } catch (error) {
      console.error('Logout failed:', error);
      alert('An error occurred during logout');
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">My App</Link>
      <div className="navbar-links">
        {isLoggedIn ? (
          <>
            {/* {roleId === 1 && <Link to="/posts" className="navbar-link">Posts</Link>}
            {roleId === 2 && <Link to="/moderator" className="navbar-link">Moderator</Link>}
            {roleId === 3 && (
              <>
                <Link to="/admin" className="navbar-link">Admin</Link>
                <Link to="/adminStatistike" className="navbar-link">Statistike</Link>
              </>
            )} */}
            <button onClick={handleLogout} className="navbar-link">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-link">Login</Link>
            <Link to="/register" className="navbar-link">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
