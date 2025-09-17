import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import useAutoNews from "../api/hooks/useAutoNews";
import "./homePage.css";


const CATEGORY_ICONS = {
  all: (props = {}) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="6" cy="8" r="2" fill="currentColor" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <circle cx="18" cy="16" r="2" fill="currentColor" />
      <circle cx="6" cy="16" r="2" fill="currentColor" opacity="0.55" />
      <circle cx="12" cy="8" r="2" fill="currentColor" opacity="0.55" />
    </svg>
  ),
  elektricni_automobili: (props = {}) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M13 2l-9 12h7v8l9-12h-7l0-8z" fill="currentColor" />
    </svg>
  ),
  oldtajmeri: (props = {}) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M4 14h1.2l1.4-4.2A3 3 0 019.5 7h5a3 3 0 012.9 2.8L18.8 14H20a1 1 0 011 1v3h-2v2h-2v-2H7v2H5v-2H3v-3a1 1 0 011-1z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="17.5" r="1.5" fill="currentColor" />
      <circle cx="16" cy="17.5" r="1.5" fill="currentColor" />
    </svg>
  ),
  sportski: (props = {}) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M6 4v16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6 4h11l-3 3 3 3-3 3 3 3H6" fill="currentColor" opacity="0.9" />
    </svg>
  ),
  odrzavanje_i_popravka: (props = {}) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M21 7.5a4.5 4.5 0 01-6.6 4.04L9 16.94V21H7v-3.06L3.56 14.5l1.42-1.42L7 15.1l4.46-4.46A4.5 4.5 0 0117.5 3a4.5 4.5 0 013.5 2.06L18 8.06 15.94 6l2.9-2.9A4.5 4.5 0 0121 7.5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

const CATEGORY_FILTERS = [
  { value: "all", label: "Sve teme", icon: "all" },
  { value: "elektricni_automobili", label: "Elektricni automobili", icon: "elektricni_automobili" },
  { value: "oldtajmeri", label: "Oldtajmeri", icon: "oldtajmeri" },
  { value: "sportski", label: "Sportski", icon: "sportski" },
  { value: "odrzavanje_i_popravka", label: "Odrzavanje i popravka", icon: "odrzavanje_i_popravka" },
];

const CATEGORY_LABELS = CATEGORY_FILTERS.filter((item) => item.value !== "all").reduce((acc, item) => {
  acc[item.value] = item.label;
  return acc;
}, {});

const CATEGORY_ORDER = CATEGORY_FILTERS.filter((item) => item.value !== "all").map((item) => item.value);
const DEFAULT_CATEGORY = "all";

const renderCategoryIcon = (key, props = {}) => {
  const Icon = CATEGORY_ICONS[key];
  return Icon ? <Icon {...props} /> : null;
};


const SearchIcon = (props = {}) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.8" />
    <line x1="15.5" y1="15.5" x2="20" y2="20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const CarIcon = (props = {}) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path
      d="M4 15h1.3l1.3-3.9A3 3 0 019.6 9h4.8a3 3 0 012.9 2.1L18.7 15H20a1 1 0 011 1v3h-2v2h-2v-2H7v2H5v-2H3v-3a1 1 0 011-1z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="8" cy="17.5" r="1.5" fill="currentColor" />
    <circle cx="16" cy="17.5" r="1.5" fill="currentColor" />
  </svg>
);

const FilterIcon = (props = {}) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M4 5h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M7 12h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M10 19h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const HeartIcon = ({ filled = false, ...props } = {}) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path
      d="M12 21s-6.2-4.35-9-7.74C-1.1 9 1.3 4.5 5.5 4.5a4.5 4.5 0 016.5 3.3A4.5 4.5 0 0118.5 4.5c4.2 0 6.6 4.5 2.5 8.76C18.2 16.65 12 21 12 21z"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
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
  const categoryOrderMap = useMemo(() => {
    const map = {};
    CATEGORY_ORDER.forEach((value, index) => {
      map[value] = index;
    });
    return map;
  }, []);

  const sortedPosts = useMemo(() => {
    if (!posts || posts.length === 0) {
      return [];
    }

    return [...posts].sort((first, second) => {
      const rankA = categoryOrderMap[first?.category] ?? CATEGORY_ORDER.length;
      const rankB = categoryOrderMap[second?.category] ?? CATEGORY_ORDER.length;

      if (rankA !== rankB) {
        return rankA - rankB;
      }

      const createdA = new Date(first?.created_at || 0).getTime();
      const createdB = new Date(second?.created_at || 0).getTime();

      return createdB - createdA;
    });
  }, [posts, categoryOrderMap]);


  const fetchPosts = async ({
    query = search,
    carMakeValue = carMake,
    categoryValue = category,
    page = 1,
    perPage = POSTS_PER_PAGE,
  } = {}) => {
    try {
      const params = {
        search: query,
        car_make: carMakeValue,
        page,
        per_page: perPage,
      };

      if (categoryValue && categoryValue !== DEFAULT_CATEGORY) {
        params.category = categoryValue;
      }

      const res = await api.get("/api/posts", { params });
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
    setCategory(DEFAULT_CATEGORY);
    fetchPosts({ query: "", carMakeValue: "", categoryValue: DEFAULT_CATEGORY, page: 1 });
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    fetchPosts({ query: search, carMakeValue: carMake, categoryValue: category, page: 1 });
  };

  const handlePageChange = (page) => {
    fetchPosts({ query: search, carMakeValue: carMake, categoryValue: category, page });
  };

  const handleCategorySelect = (value) => {
    setCategory(value);
    fetchPosts({ query: search, carMakeValue: carMake, categoryValue: value, page: 1 });
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
          <div className="panel-title">
            <h2>Pronadi savrsen automobil i ekipu</h2>
            <p>Filtriraj objave po marki ili potrazi omiljenog autora.</p>
          </div>
        </div>
        <form className="search-form" onSubmit={handleSearch}>
          <div className="category-toolbar" role="group" aria-label="Filtriraj objave po temama">
            <span className="toolbar-label">
              <FilterIcon className="toolbar-icon" aria-hidden="true" />
              Teme
            </span>
            <div className="category-pills">
              {CATEGORY_FILTERS.map((option) => {
                const isActive = category === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`category-pill ${isActive ? "active" : ""}`}
                    onClick={() => handleCategorySelect(option.value)}
                    aria-pressed={isActive}
                  >
                    {renderCategoryIcon(option.icon ?? option.value, { className: "category-pill-icon", 'aria-hidden': true })}
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <label className="field">
            <span className="field-label">
              <SearchIcon className="field-icon" aria-hidden="true" />
              Pretrazi postove, korisnike...
            </span>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Unesi kljucnu rec"
            />
          </label>
          <label className="field">
            <span className="field-label">
              <CarIcon className="field-icon" aria-hidden="true" />
              Marka automobila
            </span>
            <input
              type="text"
              value={carMake}
              onChange={(event) => setCarMake(event.target.value)}
              placeholder="npr. BMW"
            />
          </label>
          <div className="form-actions">
            <button type="submit" className="btn primary">
              Pretrazi
            </button>
            <button type="button" className="btn ghost" onClick={handleReset}>
              Resetuj
            </button>
          </div>
        </form>
      </section>

      <section className="posts-section" id="posts-feed">
        <header className="section-header">
          <h3>Najnovije objave zajednice</h3>
          <p>Pridruzi se razgovoru i podeli svoje iskustvo.</p>
        </header>
        <div className="posts-grid">
          {sortedPosts.length === 0 && <p className="empty-state">Nema postova.</p>}
          {sortedPosts.map((post) => {
            const likeCount = Number(post.likes_count ?? 0);
            const liked = Boolean(post.liked_by_current_user);
            const isPending = pendingLikes.includes(post.id);
            const disableLike = !canLike || isPending;
            const likeTitle = !canLike ? likeDisabledMessage : undefined;
            const themeLabel = CATEGORY_LABELS[post.category] || 'Nepoznata tema';

            return (
              <article key={post.id} className="post-card">
                <div className="post-meta">
                  <span className="post-author">{post.user?.name || "Nepoznat korisnik"}</span>
                  <span className="post-car">
                    {post.car?.make} {post.car?.model} ({post.car?.year})
                  </span>
                  <span className="post-category">{themeLabel}</span>
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
                    className={`like-heart ${liked ? "active" : ""}`}
                    onClick={() => handleToggleLike(post.id, liked)}
                    disabled={disableLike}
                    title={likeTitle}
                    aria-pressed={liked}
                    aria-label={liked ? "Ukloni lajk" : "Svidja mi se"}
                  >
                    <HeartIcon filled={liked} className="heart-icon" aria-hidden="true" />
                  </button>
                  <span className="like-count">{likeCount}</span>
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

