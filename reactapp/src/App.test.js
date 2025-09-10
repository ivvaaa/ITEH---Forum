// import React, { useState, useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Pocetna from './MojeKomponente/Pocetna';
// import './App.css';
// import Register from './MojeKomponente/Register';
// import Login from './MojeKomponente/Login';
// import Navbar from './MojeKomponente/Navbar';
// import PostsList from './MojeKomponente/Post/PostsList';
// import PostDetails from './MojeKomponente/Post/PostDetails';
// import Moderator from './MojeKomponente/Moderator/Moderator';
// import Admin from './MojeKomponente/Admin/Admin';
// import AdminStatistike from './MojeKomponente/Admin/AdminStatistike';

// function App() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [roleId, setRoleId] = useState(null);

//   useEffect(() => {
//     const token = sessionStorage.getItem('auth_token');
//     const role_id = sessionStorage.getItem('role_id');
//     if (token) {
//       setIsLoggedIn(true);
//       setRoleId(parseInt(role_id));  // Pretvori u broj radi sigurnosti
//     }
//   }, []);

//   return (
//     <Router>
//       <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} roleId={roleId} /> 
//       <div className="App">
//         <Routes>
//           <Route path="/" element={<Pocetna />} />
//           {isLoggedIn ? (
//             <>
//               {roleId == 1 && (
//                 <>
//                   <Route path="/posts" element={<PostsList />} />
//                   <Route path="/post/:id" element={<PostDetails />} />
//                 </>
//               )}
//               {roleId == 2 && (
//                 <>
//                   <Route path="/moderator" element={<Moderator />} />
//                 </>
//               )}
//               {roleId == 3 && (
//                 <>
//                   <Route path="/admin" element={<Admin />} />
//                   <Route path="/adminStatistike" element={<AdminStatistike />} />
//                 </>
//               )}
//             </>
//           ) : (
//             <>
//               <Route path="/register" element={<Register />} />
//               <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
//             </>
//           )}
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;
