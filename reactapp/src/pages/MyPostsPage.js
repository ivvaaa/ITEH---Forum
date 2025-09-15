import React, { useEffect, useState } from "react";
import axios from "axios";

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
            setError("Nije moguce ucitati vase postove.");
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
            setError("Greska pri azuriranju posta.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div style={{ padding: 20 }}>Ucitavanje...</div>;
    }

    return (
        <div style={{ maxWidth: 800, margin: "20px auto" }}>
            <h2>Moji postovi</h2>
            {error && <div style={{ color: "crimson", marginBottom: 16 }}>{error}</div>}
            {posts.length === 0 ? (
                <p>Jos uvek nemate objavljenih postova.</p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {posts.map(post => (
                        <div key={post.id} style={{ border: "1px solid #ccc", padding: 16, borderRadius: 8 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <h3 style={{ margin: 0 }}>{post.car ? `${post.car.make} ${post.car.model}` : "Post"}</h3>
                                <button onClick={() => startEdit(post)}>Edit</button>
                            </div>
                            <p style={{ margin: "8px 0" }}>{post.content}</p>
                            <small>Objavljeno: {new Date(post.created_at).toLocaleString()}</small>
                            {editingId === post.id && (
                                <form onSubmit={handleUpdate} style={{ marginTop: 16, display: "grid", gap: 12 }}>
                                    <div>
                                        <label>Opis</label>
                                        <textarea value={form.content} onChange={handleInputChange("content")} required />
                                    </div>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <div style={{ flex: 1 }}>
                                            <label>Marka</label>
                                            <input type="text" value={form.carMake} onChange={handleInputChange("carMake")} required />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label>Model</label>
                                            <input type="text" value={form.carModel} onChange={handleInputChange("carModel")} required />
                                        </div>
                                        <div style={{ width: 120 }}>
                                            <label>Godiste</label>
                                            <input type="number" min="1900" max="2099" value={form.carYear} onChange={handleInputChange("carYear")} required />
                                        </div>
                                    </div>
                                    <div>
                                        <label>Dodatno</label>
                                        <input type="text" value={form.other} onChange={handleInputChange("other")} />
                                    </div>
                                    <div>
                                        <label>Nove slike (opciono)</label>
                                        <input type="file" multiple accept="image/*" onChange={handleImageChange} />
                                    </div>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <button type="submit" disabled={saving}>{saving ? "Cuvanje..." : "Sacuvaj"}</button>
                                        <button type="button" onClick={cancelEdit}>Otkazi</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyPostsPage;
