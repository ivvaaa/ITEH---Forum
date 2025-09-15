import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [carMake, setCarMake] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const navigate = useNavigate();

  const POSTS_PER_PAGE = 5;

  const fetchPosts = async (query = "", carMake = "", page = 1, perPage = POSTS_PER_PAGE) => {
    const token = sessionStorage.getItem("auth_token") || localStorage.getItem("access_token");
    const res = await axios.get("http://127.0.0.1:8000/api/posts", {
      params: { search: query, car_make: carMake, page, per_page: perPage },
      headers: { Authorization: `Bearer ${token}` },
    });

    setPosts(res.data.data);
    setCurrentPage(res.data.meta?.current_page ?? 1);
    setLastPage(res.data.meta?.last_page ?? 1);
  };


  const handleReset = () => {
    setSearch("");
    setCarMake("");
    fetchPosts("", "", 1);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPosts(search, carMake, 1);
  };

  const handlePageChange = (page) => {
    fetchPosts(search, carMake, page);
  };

  const handleViewMore = (postId) => {
    navigate(`/post/${postId}`);
  };

  return (
    <div className="homepage-container">
      <form onSubmit={handleSearch} style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Pretraži postove, korisnike..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 200, marginRight: 10 }}
        />
        <input
          type="text"
          placeholder="Marka automobila"
          value={carMake}
          onChange={e => setCarMake(e.target.value)}
          style={{ width: 150, marginRight: 10 }}
        />
        <button type="submit">Pretraži</button>
        <button type="button" onClick={handleReset} style={{ marginLeft: 10 }}>
          Resetuj filtere
        </button>
      </form>

      <div className="posts-list">
        {posts.length === 0 && <p>Nema postova.</p>}
        {posts.map(post => (
          <div key={post.id} className="post-card">
            <h3>{post.user?.name || "Nepoznat korisnik"}</h3>
            <p><b>Auto:</b> {post.car?.make} {post.car?.model} ({post.car?.year})</p>
            <p>
              {post.content?.slice(0, 60)}{post.content && post.content.length > 60 ? "..." : ""}
            </p>
            {post.images && post.images.length > 0 && (
              <img src={post.images[0]} alt="slika auta" style={{ width: 100 }} />
            )}
            <br />
            <button onClick={() => handleViewMore(post.id)}>Više</button>
          </div>
        ))}
      </div>


      <div style={{ marginTop: 20 }}>
        {Array.from({ length: lastPage }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => handlePageChange(i + 1)}
            disabled={currentPage === i + 1}
            style={{ margin: 2 }}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HomePage;