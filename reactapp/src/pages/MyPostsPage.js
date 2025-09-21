import React, { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import "./managePages.css";
import { useAuth } from "../api/hooks/AuthContext";
import { useNavigate } from "react-router-dom";
import useApi from "../api/hooks/useAPI";
import { HeartIcon } from "../components/UIicons";


const initialFormState = {
    content: "",
    carMake: "",
    carModel: "",
    carYear: "",
    other: "",
    images: [],
};

const MyPostsPage = () => {
    const api = useApi();

    const { user } = useAuth();
    const roleId = user?.role_id || user?.role?.id || null;
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || ![1, 2].includes(roleId)) {
            navigate("/login");
        }
    }, [user, roleId, navigate]);
    //console.log("Trenutni user MY post:", user);
    // console.log("Token iz localStorage:", localStorage.getItem('token'));
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(initialFormState);
    const [saving, setSaving] = useState(false);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const first = await api.get("/api/posts", {
                params: { mine: true, per_page: 50, page: 1 },
            });
            let allPosts = first.data?.data || [];
            const meta = first.data?.meta || {};
            const lastPage = Number(meta.last_page || 1);

            if (lastPage > 1) {
                const requests = [];
                for (let page = 2; page <= lastPage; page += 1) {
                    requests.push(api.get("/api/posts", {
                        params: { mine: true, per_page: 50, page },
                    }));
                }
                const responses = await Promise.all(requests);
                responses.forEach((response) => {
                    allPosts = allPosts.concat(response.data?.data || []);
                });
            }
            setPosts(allPosts);
        } catch (err) {
            console.error(err);
            const message = err.response?.data?.message || "Nije moguce ucitati tvoje objave.";
            setError(message);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, []);


    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const startEdit = (post) => {
        setEditingId(post.id);
        setForm({
            content: post.content || "",
            carMake: post.car?.make || "",
            carModel: post.car?.model || "",
            carYear: post.car?.year ? String(post.car.year) : "",
            other: post.other || "",
            images: [],
        });
        setError("");
    };

    const cancelEdit = () => {
        setEditingId(null);
        setForm(initialFormState);
    };

    const handleInputChange = (field) => (event) => {
        setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

    const handleImageChange = (event) => {
        setForm((prev) => ({ ...prev, images: Array.from(event.target.files || []) }));
    };

    const handleUpdate = async (event) => {
        event.preventDefault();
        if (!editingId) return;
        setSaving(true);
        setError("");

        const formData = new FormData();
        formData.append("_method", "PUT");
        formData.append("content", form.content);
        formData.append("car_make", form.carMake);
        formData.append("car_model", form.carModel);
        formData.append("car_year", form.carYear);
        formData.append("other", form.other);
        form.images.forEach((file) => {
            formData.append("images[]", file);
        });

        try {
            await api.post(`/api/posts/${editingId}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            cancelEdit();
            fetchPosts();
        } catch (err) {
            console.error(err);
            setError("Greska pri azuriranju posta. Pokusaj ponovo.");
        } finally {
            setSaving(false);
        }
    };

    // if (loading) {
    //     return (
    //         <div className="page-shell">
    //             <section className="page-card narrow">
    //                 <p className="meta-line">Ucitavanje...</p>
    //             </section>
    //         </div>
    //     );
    // }


    return (
        <div className="page-shell">
            <section className="page-card">
                <header className="page-header">
                    <h1>Moje objave</h1>
                </header>
                {error && <div className="alert">{error}</div>}
                {posts.length === 0 ? (
                    <div className="empty-state-box">Jos uvek nema objava. Kreiraj svoju prvu pricu o automobilu!</div>
                ) : (
                    <div className="posts-collection">
                        {posts.map((post) => {
                            const likeCount = Number(post.likes_count ?? 0);
                            const likedByMe = Boolean(post.liked_by_current_user);

                            return (
                                <article key={post.id} className="my-post-card">
                                    <div className="my-post-header">
                                        <div>
                                            <h3>{post.car ? `${post.car.make} ${post.car.model}` : "Objava"}</h3>
                                            <div className="meta-line">Objavljeno: {new Date(post.created_at).toLocaleString()}</div>
                                        </div>
                                        <button type="button" className="btn ghost small" onClick={() => startEdit(post)}>
                                            Uredi
                                        </button>
                                    </div>
                                    <p className="my-post-content">{post.content}</p>
                                    <div className="my-post-like-bar">
                                        <div className={`like-heart ${likeCount > 0 ? "active" : ""}`} aria-hidden="true">
                                            <HeartIcon filled={likeCount > 0} className="heart-icon" />
                                        </div>
                                        <span className="like-count">
                                            {likeCount}
                                        </span>
                                    </div>
                                    {editingId === post.id && (
                                        <form className="edit-form" onSubmit={handleUpdate}>
                                            <label className="form-field">
                                                <span>Opis</span>
                                                <textarea value={form.content} onChange={handleInputChange("content")} required />
                                            </label>
                                            <div className="field-row">
                                                <label className="form-field">
                                                    <span>Marka</span>
                                                    <input type="text" value={form.carMake} onChange={handleInputChange("carMake")} required />
                                                </label>
                                                <label className="form-field">
                                                    <span>Model</span>
                                                    <input type="text" value={form.carModel} onChange={handleInputChange("carModel")} required />
                                                </label>
                                                <label className="form-field small">
                                                    <span>Godiste</span>
                                                    <input type="number" min="1900" max="2099" value={form.carYear} onChange={handleInputChange("carYear")} required />
                                                </label>
                                            </div>
                                            <label className="form-field">
                                                <span>Dodatno</span>
                                                <input type="text" value={form.other} onChange={handleInputChange("other")} />
                                            </label>
                                            <label className="form-field">
                                                <span>Nove slike (opciono)</span>
                                                <input type="file" multiple accept="image/*" onChange={handleImageChange} />
                                            </label>
                                            <div className="form-actions">
                                                <button type="submit" className="btn primary small" disabled={saving}>
                                                    {saving ? "Cuvanje..." : "Sacuvaj"}
                                                </button>
                                                <button type="button" className="btn ghost small" onClick={cancelEdit}>
                                                    Otkazi
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
};

export default MyPostsPage;


