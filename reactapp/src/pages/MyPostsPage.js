import React, { useEffect, useState } from "react";
import axios from "axios";
import "./managePages.css";

const initialFormState = {
    content: "",
    carMake: "",
    carModel: "",
    carYear: "",
    other: "",
    images: [],
};

const MyPostsPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(initialFormState);
    const [saving, setSaving] = useState(false);

    const fetchPosts = async () => {
        setLoading(true);
        setError("");
        const token = sessionStorage.getItem("auth_token") || localStorage.getItem("access_token");
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/posts", {
                params: { mine: true, per_page: 50 },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setPosts(res.data?.data || []);
        } catch (err) {
            console.error(err);
            setError("Nije moguće učitati tvoje objave.");
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

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

    const handleInputChange = (field) => (e) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
    };

    const handleImageChange = (e) => {
        setForm(prev => ({ ...prev, images: Array.from(e.target.files || []) }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!editingId) return;
        setSaving(true);
        setError("");
        const token = sessionStorage.getItem("auth_token") || localStorage.getItem("access_token");
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
            await axios.post(`http://127.0.0.1:8000/api/posts/${editingId}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });
            cancelEdit();
            fetchPosts();
        } catch (err) {
            console.error(err);
            setError("Greška pri ažuriranju posta. Pokušaj ponovo.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="page-shell">
                <section className="page-card narrow">
                    <p className="meta-line">Učitavanje...</p>
                </section>
            </div>
        );
    }

    return (
        <div className="page-shell">
            <section className="page-card">
                <header className="page-header">
                    <h1>Moje objave</h1>
                    <p>Pregledaj, ažuriraj ili osveži svoje postove sa staze i iz garaže.</p>
                </header>
                {error && <div className="alert">{error}</div>}
                {posts.length === 0 ? (
                    <div className="empty-state-box">Još uvek nema objava. Kreiraj svoju prvu priču o automobilu!</div>
                ) : (
                    <div className="posts-collection">
                        {posts.map((post) => (
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
                                                <span>Godište</span>
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
                                                {saving ? "Čuvanje..." : "Sačuvaj"}
                                            </button>
                                            <button type="button" className="btn ghost small" onClick={cancelEdit}>
                                                Otkaži
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default MyPostsPage;
