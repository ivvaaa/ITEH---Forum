import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const PostDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);

    useEffect(() => {
        const token = sessionStorage.getItem("auth_token") || localStorage.getItem("access_token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        axios
            .get(`http://127.0.0.1:8000/api/posts/${id}`, { headers })
            .then((res) => {
                setPost(res.data.data || res.data);
                setComments(res.data.data?.comments || res.data.comments || []);
            })
            .catch((err) => {
                console.error(err);
                navigate("/");
            });
    }, [id, navigate]);

    if (!post) return <div className="page-shell"><div className="page-card narrow">Učitavanje...</div></div>;

    const normalizeImages = (images) => {
        if (!images) return [];
        if (Array.isArray(images)) return images;
        if (typeof images === "string") {
            try {
                const parsed = JSON.parse(images);
                if (Array.isArray(parsed)) {
                    return parsed;
                }
            } catch (error) { }
            return images ? [images] : [];
        }
        return [];
    };

    const images = normalizeImages(post.images);

    return (
        <div className="page-shell">
            <div className="page-card narrow">
                <button
                    type="button"
                    className="btn ghost"
                    style={{ marginBottom: 18, width: "fit-content" }}
                    onClick={() => navigate(-1)}
                >
                    ← Nazad
                </button>
                <div className="page-header">
                    <h1>
                        {post.user?.name || "Nepoznat korisnik"}
                    </h1>
                    <p>
                        <b>Auto:</b> {post.car?.make} {post.car?.model} ({post.car?.year})
                    </p>
                </div>
                <div className="my-post-content" style={{ marginBottom: 18 }}>
                    {post.content}
                </div>
                {images.length > 0 && (
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
                        {images.map((img, idx) => (
                            <img
                                key={idx}
                                src={img}
                                alt="slika auta"
                                style={{
                                    width: 180,
                                    borderRadius: 14,
                                    border: "1px solid rgba(120,124,133,0.18)",
                                    background: "#18181b",
                                    objectFit: "cover"
                                }}
                            />
                        ))}
                    </div>
                )}
                <div className="meta-line" style={{ marginBottom: 18 }}>
                    {post.created_at}
                </div>
                <hr style={{ border: "none", borderTop: "1px solid var(--panel-border)", margin: "18px 0" }} />
                <h4>Komentari</h4>
                {comments.length === 0 && (
                    <div className="empty-state-box">Nema komentara.</div>
                )}
                <div className="posts-collection">
                    {comments.map((c) => (
                        <div key={c.id} className="my-post-card" style={{ padding: 16, borderRadius: 14 }}>
                            <div className="my-post-header" style={{ marginBottom: 6 }}>
                                <b>{c.user?.name || "Anonimni korisnik"}</b>
                                <span className="meta-line">{c.created_at}</span>
                            </div>
                            <div className="my-post-content">{c.content}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PostDetails;