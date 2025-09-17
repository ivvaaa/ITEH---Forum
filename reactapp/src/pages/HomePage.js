import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import useAutoNews from "../api/hooks/useAutoNews";
import "./homePage.css";

const getStoredUser = () => {
  try {
    return (
      JSON.parse(sessionStorage.getItem("user")) ||
      JSON.parse(localStorage.getItem("user")) ||
      null
    );
  } catch (error) {
    return null;
  }
};

const resolveRoleId = (user) => {
  const storedRole = sessionStorage.getItem("role_id");
  if (storedRole) {
    const parsed = Number(storedRole);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  if (user?.role_id != null) {
    const parsed = Number(user.role_id);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  if (user?.role?.id != null) {
    const parsed = Number(user.role.id);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return null;
};

const getAuthToken = () => {
  return (
    sessionStorage.getItem("auth_token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    null
  );
};

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [carMake, setCarMake] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [pendingLikes, setPendingLikes] = useState([]);

  const storedUser = getStoredUser();
  const roleId = resolveRoleId(storedUser);
  const authToken = getAuthToken();
  const canLike = Boolean(authToken) && Boolean(storedUser) && roleId != null && [1, 2].includes(roleId);

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
    try {
      const res = await api.get("/api/posts", {
        params: { search: query, car_make: carMakeValue, page, per_page: perPage },
      });
      const payload = res.data || {};
      setPosts(payload.data || []);
      setCurrentPage(payload.meta?.current_page ?? 1);
      setLastPage(payload.meta?.last_page ?? 1);
    } catch (error) {
      console.error(error);
      setPosts([]);
      setCurrentPage(1);
      setLastPage(1);
    } finally {
      setPendingLikes([]);
    }
  };

  const handleReset = () => {
    setSearch("");
    setCarMake("");
    fetchPosts("", "", 1);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
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

  const handleToggleLike = async (postId, currentlyLiked) => {
    if (!canLike) {
      return;
    }

    if (pendingLikes.includes(postId)) {
      return;
    }

    setPendingLikes((prev) => (prev.includes(postId) ? prev : [...prev, postId]));

    try {
      const response = currentlyLiked
        ? await api.delete(`/api/posts/${postId}/like`)
        : await api.post(`/api/posts/${postId}/like`);

      const payload = response?.data || {};
      const likesCount = typeof payload.likes_count === "number" ? payload.likes_count : undefined;
      const likedFlag = typeof payload.liked === "boolean" ? payload.liked : !currentlyLiked;

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id !== postId) {
            return post;
          }

          const currentCount = Number(post.likes_count ?? 0);
          const nextCount = likesCount !== undefined
            ? likesCount
            : currentlyLiked
              ? Math.max(currentCount - 1, 0)
              : currentCount + 1;

          return {
            ...post,
            likes_count: nextCount,
            liked_by_current_user: likedFlag,
          };
        })
      );
    } catch (error) {
      console.error(error);
    } finally {
      setPendingLikes((prev) => prev.filter((id) => id !== postId));
    }
  };

  const likeDisabledMessage = "Samo prijavljeni korisnici sa ulogom korisnik ili admin mogu da lajkuju.";

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
            <h2>Pronadi savrsen automobil i ekipu</h2>
            <p>Filtriraj objave po marki ili potrazi omiljenog autora.</p>
          </div>
          <button type="button" className="btn link" onClick={handleReset}>
            Resetuj filtere
          </button>
        </div>
        <form className="search-form" onSubmit={handleSearch}>
          <label className="field">
            <span>Pretrazi postove, korisnike...</span>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Unesi kljucnu rec"
            />
          </label>
          <label className="field">
            <span>Marka automobila</span>
            <input
              type="text"
              value={carMake}
              onChange={(event) => setCarMake(event.target.value)}
              placeholder="npr. BMW"
            />
          </label>
          <button type="submit" className="btn primary">
            Pretrazi
          </button>
        </form>
      </section>

      <section className="posts-section" id="posts-feed">
        <header className="section-header">
          <h3>Najnovije objave zajednice</h3>
          <p>Pridruzi se razgovoru i podeli svoje iskustvo.</p>
        </header>
        <div className="posts-grid">
          {posts.length === 0 && <p className="empty-state">Nema postova.</p>}
          {posts.map((post) => {
            const likeCount = Number(post.likes_count ?? 0);
            const liked = Boolean(post.liked_by_current_user);
            const isPending = pendingLikes.includes(post.id);
            const disableLike = !canLike || isPending;
            const likeTitle = !canLike ? likeDisabledMessage : undefined;

            return (
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
                  Vise detalja
                </button>
                <div className="post-like-bar">
                  <button
                    type="button"
                    className={`btn link ${liked ? "active" : ""}`}
                    onClick={() => handleToggleLike(post.id, liked)}
                    disabled={disableLike}
                    title={likeTitle}
                  >
                    {liked ? "Ukloni lajk" : "Svidja mi se"}
                  </button>
                  <span className="like-count">
                    {likeCount} {likeCount === 1 ? "lajk" : "lajkova"}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
        {lastPage > 1 && (
          <div className="pagination">
            {Array.from({ length: lastPage }, (_, index) => (
              <button
                key={index + 1}
                type="button"
                onClick={() => handlePageChange(index + 1)}
                className={`page-btn ${currentPage === index + 1 ? "active" : ""}`}
              >
                {index + 1}
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
            {newsLoading ? "Ucitavanje..." : "Osvezi"}
          </button>
        </div>
        {newsLoading ? (
          <p className="info">Ucitavanje vesti...</p>
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

