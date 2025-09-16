import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useAutoNews from "../api/hooks/useAutoNews";
import "./homePage.css";

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [carMake, setCarMake] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const navigate = useNavigate();
  const { articles: news, loading: newsLoading, error: newsError, refresh: refreshNews } = useAutoNews();

  const formatPublished = (iso) => {
    if (!iso) return "Nepoznat datum";
    const parsed = Date.parse(iso);
    if (Number.isNaN(parsed)) return iso;
    return new Date(parsed).toLocaleString("sr-RS", { dateStyle: "medium", timeStyle: "short" });
  };

  const POSTS_PER_PAGE = 5;

  const fetchPosts = async (query = "", carMakeValue = "", page = 1, perPage = POSTS_PER_PAGE) => {
    const token = sessionStorage.getItem("auth_token") || localStorage.getItem("access_token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axios.get("http://127.0.0.1:8000/api/posts", {
      params: { search: query, car_make: carMakeValue, page, per_page: perPage },
      headers,
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

  const handleCreatePost = () => {
    navigate("/create");
  };

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToSearch = () => scrollToSection("search-panel");
  const scrollToPosts = () => scrollToSection("posts-feed");
  const scrollToNews = () => scrollToSection("news-section");

  return (
    <div className="homepage">
      <section className="hero-section">
        <div className="hero-overlay" />

        <div className="hero-main">
          <div className="hero-text">
            <h1 className="hero-title">
              <span>UNLEASH</span>
              <span className="stroke">YOUR</span>
              <span>NEED FOR</span>
              <span className="stroke">SPEED</span>
            </h1>



          </div>
          <div className="hero-visual" aria-hidden="true">
            <img
              src="https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1200&q=80"
              alt="Sportski automobil"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section className="search-panel" id="search-panel">
        <div className="panel-header">
          <div>
            <h2>Pronađi savršen automobil i ekipu</h2>
            <p>Filtriraj objave po marki ili potraži omiljenog autora.</p>
          </div>
          <button type="button" className="btn link" onClick={handleReset}>
            Resetuj filtere
          </button>
        </div>
        <form className="search-form" onSubmit={handleSearch}>
          <label className="field">
            <span>Pretraži postove, korisnike...</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Unesi ključnu reč"
            />
          </label>
          <label className="field">
            <span>Marka automobila</span>
            <input
              type="text"
              value={carMake}
              onChange={(e) => setCarMake(e.target.value)}
              placeholder="npr. BMW"
            />
          </label>
          <button type="submit" className="btn primary">
            Pretraži
          </button>
        </form>
      </section>

      <section className="posts-section" id="posts-feed">
        <header className="section-header">
          <h3>Najnovije objave zajednice</h3>
          <p>Pridruži se razgovoru i podeli svoje iskustvo.</p>
        </header>
        <div className="posts-grid">
          {posts.length === 0 && <p className="empty-state">Nema postova.</p>}
          {posts.map((post) => (
            <article key={post.id} className="post-card">
              <div className="post-meta">
                <span className="post-author">{post.user?.name || "Nepoznat korisnik"}</span>
                <span className="post-car">
                  {post.car?.make} {post.car?.model} ({post.car?.year})
                </span>
              </div>
              <p className="post-content">
                {post.content?.slice(0, 120)}
                {post.content && post.content.length > 120 ? "..." : ""}
              </p>
              {post.images && post.images.length > 0 && (
                <div className="post-media">
                  <img src={post.images[0]} alt="Slika automobila" loading="lazy" />
                </div>
              )}
              <button type="button" className="btn ghost" onClick={() => handleViewMore(post.id)}>
                Više detalja
              </button>
            </article>
          ))}
        </div>
        {lastPage > 1 && (
          <div className="pagination">
            {Array.from({ length: lastPage }, (_, i) => (
              <button
                key={i + 1}
                type="button"
                onClick={() => handlePageChange(i + 1)}
                className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="news-section" id="news-section">
        <div className="section-header">
          <h3>Vesti iz auto sveta</h3>
          <button
            type="button"
            onClick={refreshNews}
            disabled={newsLoading}
            className="btn primary"
          >
            {newsLoading ? "Učitavanje..." : "Osveži"}
          </button>
        </div>
        {newsLoading ? (
          <p className="info">Učitavanje vesti...</p>
        ) : newsError ? (
          <p className="error">{newsError}</p>
        ) : news.length === 0 ? (
          <p className="info">Trenutno nema novih vesti.</p>
        ) : (
          <div className="news-grid">
            {news.map((article) => (
              <article key={article.id} className="news-card">
                <h4>{article.title}</h4>
                <p>{article.summary}</p>
                <div className="news-meta">
                  <span>{article.source}</span>
                  <span>{formatPublished(article.published_at)}</span>
                </div>
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  Otvori vest
                </a>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
