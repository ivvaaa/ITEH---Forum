import React, { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";


const CATEGORY_OPTIONS = [
    { value: "elektricni_automobili", label: "Elektricni automobili" },
    { value: "oldtajmeri", label: "Oldtajmeri" },
    { value: "sportski", label: "Sportski" },
    { value: "odrzavanje_i_popravka", label: "Odrzavanje i popravka" },
];

export default function CreatePostPage() {
    const [content, setContent] = useState("");
    const [carMake, setCarMake] = useState("");
    const [carModel, setCarModel] = useState("");
    const [carYear, setCarYear] = useState("");
    const [categories, setCategories] = useState([CATEGORY_OPTIONS[0].value]);
    const [images, setImages] = useState([]);
    const [other, setOther] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleImageChange = (e) => {
        setImages([...e.target.files]);
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
            setError("Greska pri kreiranju posta.");
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
                        <input type="file" multiple accept="image/*" onChange={handleImageChange} />
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


