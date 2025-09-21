import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import useAutoNews from "../api/hooks/useAutoNews";
import useFuelPrices from "../api/hooks/useFuelPrices";
import "./homePage.css";
import { useAuth } from "../api/hooks/AuthContext";
import {
  CATEGORY_FILTERS,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  renderCategoryIcon
} from "../components/categoryIcons";
import { SearchIcon, CarIcon, FilterIcon, HeartIcon } from "../components/UIicons";

const DEFAULT_CATEGORY = "all";

const normalizePostCategories = (value) => {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    return [value.trim()];
  }
  return [];
};

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [carMake, setCarMake] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([DEFAULT_CATEGORY]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [pendingLikes, setPendingLikes] = useState([]);
  const { user, login, logout } = useAuth();
  console.log("Trenutni user:", user);
  console.log("Token iz localStorage:", localStorage.getItem('token'));


  // //const storedUser = getStoredUser();
  // const roleId = resolveRoleId(storedUser);
  // const authToken = getAuthToken();
  // const canLike = Boolean(authToken) && Boolean(storedUser) && roleId != null && [1, 2].includes(roleId);
  const roleId = user?.role_id || user?.role?.id || null;
  const canLike = !!user && roleId != null && [1, 2].includes(roleId);

  const navigate = useNavigate();
  const { articles: news, loading: newsLoading, error: newsError, refresh: refreshNews } = useAutoNews();
  const { prices: fuelPrices, loading: fuelLoading, error: fuelError, refresh: refreshFuel } = useFuelPrices();

  const formatPublished = (iso) => {
    if (!iso) return "Nepoznat datum";
    const parsed = Date.parse(iso);
    if (Number.isNaN(parsed)) return iso;
    return new Date(parsed).toLocaleString("sr-RS", { dateStyle: "medium", timeStyle: "short" });
  };

  const POSTS_PER_PAGE = 3;

  const categoryOrderMap = useMemo(() => {
    const map = {};
    CATEGORY_ORDER.forEach((value, index) => {
      map[value] = index;
    });
    return map;
  }, []);

  const fetchPosts = async ({
    query = search,
    carMakeValue = carMake,
    categoriesValue = selectedCategories,
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

      const normalizedCategories = Array.isArray(categoriesValue) ? categoriesValue : [categoriesValue];
      const filteredCategories = normalizedCategories.filter((item) => item && item !== DEFAULT_CATEGORY);

      if (filteredCategories.length > 0) {
        params.categories = filteredCategories;
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

  const computeCategoryRank = (values) => {
    const normalized = normalizePostCategories(values);
    if (normalized.length === 0) {
      return CATEGORY_ORDER.length;
    }

    return normalized.reduce((rank, value) => {
      const candidate = categoryOrderMap[value] ?? CATEGORY_ORDER.length;
      return candidate < rank ? candidate : rank;
    }, CATEGORY_ORDER.length);
  };

  const sortedPosts = useMemo(() => {
    if (!posts || posts.length === 0) {
      return [];
    }

    return [...posts].sort((first, second) => {
      const rankA = computeCategoryRank(first.categories ?? first.category);
      const rankB = computeCategoryRank(second.categories ?? second.category);

      if (rankA !== rankB) {
        return rankA - rankB;
      }

      const createdA = new Date(first?.created_at || 0).getTime();
      const createdB = new Date(second?.created_at || 0).getTime();

      return createdB - createdA;
    });
  }, [posts, categoryOrderMap]);

  const handleReset = () => {
    setSearch("");
    setCarMake("");
    setSelectedCategories([DEFAULT_CATEGORY]);
    setCurrentPage(1);
    fetchPosts({ query: "", carMakeValue: "", categoriesValue: [DEFAULT_CATEGORY], page: 1 });
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    setCurrentPage(1);
    fetchPosts({ query: search, carMakeValue: carMake, categoriesValue: selectedCategories, page: 1 });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchPosts({ query: search, carMakeValue: carMake, categoriesValue: selectedCategories, page });
  };

  const handleCategoryToggle = (value) => {
    setSelectedCategories((prev) => {
      if (value === DEFAULT_CATEGORY) {
        const nextCategories = [DEFAULT_CATEGORY];
        setCurrentPage(1);
        fetchPosts({ query: search, carMakeValue: carMake, categoriesValue: nextCategories, page: 1 });
        return nextCategories;
      }

      const filtered = prev.filter((item) => item !== DEFAULT_CATEGORY);
      let next;

      if (filtered.includes(value)) {
        next = filtered.filter((item) => item !== value);
      } else {
        next = [...filtered, value];
      }

      if (next.length === 0) {
        next = [DEFAULT_CATEGORY];
      }

      setCurrentPage(1);
      fetchPosts({ query: search, carMakeValue: carMake, categoriesValue: next, page: 1 });
      return next;
    });
  };

  const handleViewMore = (postId) => {
    navigate(`/post/${postId}`);
  };

  const handleCreatePost = () => {
    // const sessionToken = typeof window !== 'undefined' ? sessionStorage.getItem('auth_token') : null;
    // const canCreate = Boolean(sessionToken) && roleId != null && [1, 2].includes(roleId);

    // if (!canCreate) {
    //   window.alert('Morate se ulogovati.');
    //   navigate('/login');
    //   return;
    // }

    // navigate('/create');
    if (!user || roleId == null || ![1, 2].includes(roleId)) {
      window.alert('Morate se ulogovati.');
      navigate('/login');
      return;
    }
    navigate('/create');
  };

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToFilters = () => scrollToSection("community-feed");
  const scrollToPosts = () => scrollToSection("community-feed");
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
            <div className="hero-actions">
              <div className="hero-nav">
                <button type="button" onClick={handleCreatePost}>
                  Kreiraj objavu
                </button>
                <button type="button" onClick={scrollToPosts}>
                  Objave
                </button>
                <button type="button" onClick={scrollToNews}>
                  Vesti
                </button>
              </div>
            </div>
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

      <section className="feed-section" id="community-feed">
        <div className="feed-header">
          <div className="feed-title">
            <h2>Pronadji savrsen automobil i ekipu</h2>
            <p>Filtriraj objave po temi, marki ili potrazi omiljenog autora.</p>
          </div>
        </div>

        <form className="feed-filter-form" onSubmit={handleSearch}>
          <div className="category-toolbar" role="group" aria-label="Filtriraj objave po temama">
            <span className="toolbar-label">
              <FilterIcon className="toolbar-icon" aria-hidden="true" />
              Teme
            </span>
            <div className="category-pills">
              {CATEGORY_FILTERS.map((option) => {
                const isActive = selectedCategories.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`category-pill ${isActive ? "active" : ""}`}
                    onClick={() => handleCategoryToggle(option.value)}
                    aria-pressed={isActive}
                  >
                    {renderCategoryIcon(option.icon ?? option.value, { className: "category-pill-icon", "aria-hidden": true })}
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="filter-grid">
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
          </div>

          <div className="form-actions feed">
            <button type="submit" className="btn primary">
              Pretrazi
            </button>
            <button type="button" className="btn ghost" onClick={handleReset}>
              Resetuj
            </button>
          </div>
        </form>

        <div className="feed-posts">
          <header className="feed-subheader">
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
              const categoryValues = normalizePostCategories(post.categories ?? post.category);

              return (
                <article key={post.id} className="post-card">
                  <div className="post-meta">
                    <span className="post-author">{post.user?.name || "Nepoznat korisnik"}</span>
                    <span className="post-car">
                      {post.car?.make} {post.car?.model} ({post.car?.year})
                    </span>
                  </div>
                  <div className="post-tags">
                    {categoryValues.length === 0 ? (
                      <span className="post-tag">Bez teme</span>
                    ) : (
                      categoryValues.map((value) => (
                        <span key={value} className="post-tag">
                          {CATEGORY_LABELS[value] || value}
                        </span>
                      ))
                    )}
                  </div>
                  <p className="post-content">
                    {post.content?.slice(0, 220)}
                    {post.content && post.content.length > 220 ? "..." : ""}
                  </p>
                  {post.images && post.images.length > 0 && (
                    <div className="post-media">
                      <img src={post.images[0]} alt="Slika automobila" loading="lazy" />
                    </div>
                  )}
                  <div className="post-actions">
                    <button type="button" className="post-details-btn" onClick={() => handleViewMore(post.id)}>
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
        </div>
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

      <section className="fuel-section" aria-label="Cene goriva">
        <div className="fuel-card">
          <div className="fuel-card-header">
            <h2>Aktuelne cene goriva</h2>
            <button type="button" className="btn ghost" onClick={refreshFuel} disabled={fuelLoading}>
              {fuelLoading ? "Osvezavanje..." : "Osvezi"}
            </button>
          </div>
          {fuelLoading ? (
            <p className="fuel-info">Ucitavanje cena...</p>
          ) : fuelError ? (
            <p className="fuel-error">{fuelError}</p>
          ) : (
            <div className="fuel-grid">
              {fuelPrices.map((item) => (
                <article key={item.id} className="fuel-item">
                  <h3>{item.label}</h3>
                  <p className="fuel-price">{item.latest.value.toFixed(2)} <span>{item.latest.units}</span></p>
                  {item.latest.updatedAt && <p className="fuel-updated">Azurirano: {item.latest.updatedAt}</p>}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

// const getStoredUser = () => {
//   try {
//     return (
//       JSON.parse(sessionStorage.getItem("user")) ||
//       JSON.parse(localStorage.getItem("user")) ||
//       null
//     );
//   } catch (error) {
//     return null;
//   }
// };

// const resolveRoleId = (user) => {
//   const storedRole = sessionStorage.getItem("role_id");
//   if (storedRole) {
//     const parsed = Number(storedRole);
//     if (!Number.isNaN(parsed)) {
//       return parsed;
//     }
//   }
//   if (user?.role_id != null) {
//     const parsed = Number(user.role_id);
//     if (!Number.isNaN(parsed)) {
//       return parsed;
//     }
//   }
//   if (user?.role?.id != null) {
//     const parsed = Number(user.role.id);
//     if (!Number.isNaN(parsed)) {
//       return parsed;
//     }
//   }
//   return null;
// };

// const getAuthToken = () => {
//   return (
//     sessionStorage.getItem("auth_token") ||
//     localStorage.getItem("access_token") ||
//     localStorage.getItem("token") ||
//     null
//   );
// };

export default HomePage;



