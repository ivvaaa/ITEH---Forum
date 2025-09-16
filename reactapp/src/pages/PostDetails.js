import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./postDetails.css";

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
        return Number.isNaN(parsed) ? null : parsed;
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

const normalizeImages = (images) => {
    if (!images) return [];
    if (Array.isArray(images)) return images;
    if (typeof images === "string") {
        try {
            const parsed = JSON.parse(images);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        } catch (error) {
            /* ignore */
        }
        return images ? [images] : [];
    }
    return [];
};

const extractComments = (payload) => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
};

const formatDateTime = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${dd}.${mm}.${yyyy}. - ${hh}:${min}`;
};

const PostDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentValue, setCommentValue] = useState("");
    const [commentError, setCommentError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const storedUser = useMemo(() => getStoredUser(), []);
    const roleId = useMemo(() => resolveRoleId(storedUser), [storedUser]);
    const canComment = Boolean(storedUser) && roleId != null && [1, 2].includes(roleId);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const token = getAuthToken();
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const response = await axios.get(`http://127.0.0.1:8000/api/posts/${id}`, { headers });
                const payload = response.data?.data || response.data || {};
                setPost(payload);
                setComments(extractComments(payload.comments));
            } catch (error) {
                console.error(error);
                navigate("/");
            }
        };

        fetchPost();
    }, [id, navigate]);

    if (!post) {
        return (
            <div className="post-details-page">
                <div className="post-details-panel">Učitavanje...</div>
            </div>
        );
    }

    const images = normalizeImages(post.images);

    const handleCommentSubmit = async (event) => {
        event.preventDefault();
        setCommentError("");

        if (!canComment) {
            setCommentError("Nemate dozvolu za ostavljanje komentara.");
            return;
        }

        const trimmed = commentValue.trim();
        if (!trimmed) {
            setCommentError("Unesite sadržaj komentara.");
            return;
        }

        const token = getAuthToken();
        if (!token) {
            setCommentError("Morate biti prijavljeni kako biste ostavili komentar.");
            return;
        }

        setSubmitting(true);

        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/api/comments",
                {
                    post_id: post.id,
                    content: trimmed,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const created = response.data?.data || response.data || {};
            const normalized = {
                ...created,
                user: created.user || storedUser,
            };
            setComments((prev) => [...prev, normalized]);
            setCommentValue("");
        } catch (error) {
            const message = error.response?.data?.message || "Došlo je do greške. Pokušajte ponovo.";
            setCommentError(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="post-details-page">
            {/* Dugme za nazad skroz levo */}
            <div style={{ position: "absolute", left: 0, top: 40, zIndex: 10, paddingLeft: 32 }}>
                <button type="button" className="btn ghost" onClick={() => navigate(-1)}>
                    Nazad
                </button>
            </div>

            <section className="post-details-panel">
                <header className="post-details-header" style={{ flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                    {/* Autor i vreme u jednom redu, suptilno */}
                    <div style={{
                        fontSize: "1rem",
                        color: "var(--text-muted)",
                        fontWeight: 500,
                        letterSpacing: "0.04em",
                        marginBottom: 10,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        justifyContent: "center"
                    }}>
                        <span>Autor:</span>
                        <span style={{ fontWeight: 600 }}>{post.user?.name || "Nepoznat korisnik"}</span>
                        <span style={{ fontSize: "0.95em", color: "rgba(148,163,184,0.78)" }}>• {formatDateTime(post.created_at)}</span>
                    </div>
                    {/* Auto markirano, veliko, crveni outline */}
                    <div
                        style={{
                            fontSize: "1.25rem",
                            fontWeight: 600,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: "var(--text-primary)",
                            border: "1.5px solid var(--accent)",
                            borderRadius: 18,
                            padding: "4px 18px",
                            marginBottom: 10,
                            display: "inline-block",
                            background: "rgba(239,35,60,0.06)"
                        }}
                    >
                        {post.car?.make} {post.car?.model} {post.car?.year}
                    </div>
                    {post.other && <p className="post-details-additional">{post.other}</p>}
                </header>

                <article className="post-details-body" style={{ textAlign: "center", fontSize: "1.13rem" }}>
                    <p>{post.content}</p>
                </article>

                {images.length > 0 && (
                    <section className="post-details-gallery">
                        {images.map((img, idx) => (
                            <img key={`${img}-${idx}`} src={img} alt="Slika automobila" loading="lazy" />
                        ))}
                    </section>
                )}

                <section className="post-details-comments" id="post-comments">
                    <div className="post-section-heading">
                        <h2>Komentari</h2>
                        <span className="muted">{comments.length} ukupno</span>
                    </div>

                    {comments.length === 0 ? (
                        <div className="empty-state-box">Još uvek nema komentara.</div>
                    ) : (
                        <div className="post-comments-list">
                            {comments.map((comment) => (
                                <article key={comment.id} className="post-comment-card">
                                    <header>
                                        <strong>{comment.user?.name || "Anonimni korisnik"}</strong>
                                        <time dateTime={comment.created_at}>{formatDateTime(comment.created_at)}</time>
                                    </header>
                                    <p>{comment.content}</p>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                <section className="post-comment-form">
                    {canComment ? (
                        <form onSubmit={handleCommentSubmit} className="comment-form">
                            <label htmlFor="comment-content">Vaš komentar</label>
                            <textarea
                                id="comment-content"
                                value={commentValue}
                                onChange={(event) => setCommentValue(event.target.value)}
                                placeholder="Podelite svoje mišljenje..."
                                rows={4}
                            />
                            {commentError && <div className="comment-error">{commentError}</div>}
                            <div className="comment-actions">
                                <button type="submit" className="btn primary" disabled={submitting}>
                                    {submitting ? "Slanje..." : "Pošalji komentar"}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <p className="comment-disabled">Samo ulogovani korisnici sa ulogom 1 ili 2 mogu da ostave komentar.</p>
                    )}
                </section>
            </section>
        </div>
    );
};

export default PostDetails;