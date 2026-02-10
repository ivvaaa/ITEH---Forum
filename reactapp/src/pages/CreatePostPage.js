import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../api/hooks/AuthContext";

const CATEGORY_OPTIONS = [
    { value: "elektricni_automobili", label: "Elektricni automobili" },
    { value: "oldtajmeri", label: "Oldtajmeri" },
    { value: "sportski", label: "Sportski" },
    { value: "odrzavanje_i_popravka", label: "Odrzavanje i popravka" },
];

export default function CreatePostPage() {
    const { user } = useAuth();
    const roleId = user?.role_id || user?.role?.id || null;
    const navigate = useNavigate();

    console.log("user:", user, "roleId:", roleId);
    const [content, setContent] = useState("");
    const [carMake, setCarMake] = useState("");
    const [carModel, setCarModel] = useState("");
    const [carYear, setCarYear] = useState("");
    const [categories, setCategories] = useState([CATEGORY_OPTIONS[0].value]);
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [other, setOther] = useState("");
    const [error, setError] = useState("");

    const MAX_FILE_SIZE = 2048 * 1024; // 2MB in bytes

    useEffect(() => {
        if (user === undefined) return; // čekaj dok se user ne učita
        if (!user || ![1, 2].includes(roleId)) {
            navigate("/login");
        }
    }, [user, roleId, navigate]);

    if (user === undefined) {
        return <div>Učitavanje...</div>;
    }

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setError(""); // Clear previous errors
        
        // Check file sizes
        const validFiles = [];
        const oversizedFiles = [];
        
        files.forEach(file => {
            if (file.size > MAX_FILE_SIZE) {
                oversizedFiles.push(`${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
            } else {
                validFiles.push(file);
            }
        });
        
        if (oversizedFiles.length > 0) {
            setError(`Ove slike su prevelike (max 2MB):\n${oversizedFiles.join('\n')}`);
        }
        
        setImages(validFiles);
        
        // Create preview URLs only for valid files
        const previews = validFiles.map(file => URL.createObjectURL(file));
        setImagePreviews(previews);
    };

    const removeImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        setImages(newImages);
        setImagePreviews(newPreviews);
    };

    const toggleCategory = (value) => {
        setCategories((prev) => {
            if (prev.includes(value)) {
                if (prev.length === 1) {
                    return prev;
                }
                return prev.filter((item) => item !== value);
            }

            return [...prev, value];
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (categories.length === 0) {
            setError('Izaberi bar jednu temu.');
            return;
        }

        const formData = new FormData();
        formData.append("content", content);
        formData.append("car_make", carMake);
        formData.append("car_model", carModel);
        formData.append("car_year", carYear);
        categories.forEach((value) => {
            formData.append('categories[]', value);
        });
        formData.append("other", other);
        for (let i = 0; i < images.length; i++) {
            formData.append("images[]", images[i]);
        }

        try {
            await api.post("/api/posts", formData);
            navigate("/");
        } catch (err) {
            console.error("Full error:", err);
            console.error("Error response:", err.response?.data);
            
            // Show detailed validation errors
            if (err.response?.status === 422) {
                const errors = err.response.data?.errors || err.response.data;
                if (typeof errors === 'object') {
                    const errorMessages = Object.values(errors)
                        .flat()
                        .join('\n');
                    setError(`Greška pri validaciji:\n${errorMessages}`);
                } else {
                    setError("Greška pri kreiranju posta - problem sa validacijom podataka.");
                }
            } else {
                setError("Greška pri kreiranju posta.");
            }
        }
    };

    return (
        <div className="page-shell">
            <div className="page-card narrow">
                <div className="page-header">
                    <h1>Kreiraj novi post</h1>
                </div>
                <form className="form-grid" onSubmit={handleSubmit}>
                    <div className="form-field">
                        <span>Opis posta</span>
                        <textarea
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            required
                            placeholder="Napisite nesto o svom automobilu, iskustvu ili dogadjaju..."
                        />
                    </div>
                    <div className="field-row">
                        <div className="form-field">
                            <span>Marka</span>
                            <input
                                type="text"
                                value={carMake}
                                onChange={e => setCarMake(e.target.value)}
                                required
                                placeholder="npr. BMW"
                            />
                        </div>
                        <div className="form-field">
                            <span>Model</span>
                            <input
                                type="text"
                                value={carModel}
                                onChange={e => setCarModel(e.target.value)}
                                required
                                placeholder="npr. 320d"
                            />
                        </div>
                        <div className="form-field small">
                            <span>Godina</span>
                            <input
                                type="number"
                                value={carYear}
                                onChange={e => setCarYear(e.target.value)}
                                required
                                min={1900}
                                max={2099}
                                placeholder="npr. 2012"
                            />
                        </div>
                    </div>
                    <div className="form-field">
                        <span>Teme</span>
                        <div className="category-toggle-group">
                            {CATEGORY_OPTIONS.map((option) => {
                                const active = categories.includes(option.value);
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        className={`category-toggle ${active ? 'active' : ''}`}
                                        onClick={() => toggleCategory(option.value)}
                                    >
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>
                        <small className="field-hint">Mozes oznaciti vise tema relevantnih za objavu.</small>
                    </div>
                    <div className="form-field">
                        <span>Slike (opciono)</span>
                        <small className="field-hint">Maksimalno 2MB po slici, dozvoljeni formati: JPG, PNG, GIF, SVG</small>
                        <input type="file" multiple accept="image/*" onChange={handleImageChange} />
                        {imagePreviews.length > 0 && (
                            <div className="image-preview-container">
                                {imagePreviews.map((preview, idx) => (
                                    <div key={idx} className="image-preview-item">
                                        <img src={preview} alt={`Preview ${idx}`} />
                                        <button
                                            type="button"
                                            className="remove-image-btn"
                                            onClick={() => removeImage(idx)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="form-field">
                        <span>Dodatne informacije (opciono)</span>
                        <input
                            type="text"
                            value={other}
                            onChange={e => setOther(e.target.value)}
                            placeholder="Npr. tuning, posebne modifikacije..."
                        />
                    </div>
                    {error && <div className="alert">{error}</div>}
                    <div className="form-actions">
                        <button type="submit" className="btn primary">Sačuvaj</button>
                    </div>
                </form>
            </div>
        </div>
    );
}


