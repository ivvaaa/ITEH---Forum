import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


export default function CreatePostPage() {
    const [content, setContent] = useState("");
    const [carMake, setCarMake] = useState("");
    const [carModel, setCarModel] = useState("");
    const [carYear, setCarYear] = useState("");
    const [images, setImages] = useState([]);
    const [other, setOther] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleImageChange = (e) => {
        setImages([...e.target.files]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        const token = sessionStorage.getItem("auth_token") || localStorage.getItem("access_token");
        const formData = new FormData();
        formData.append("content", content);
        formData.append("car_make", carMake);
        formData.append("car_model", carModel);
        formData.append("car_year", carYear);
        formData.append("other", other);
        for (let i = 0; i < images.length; i++) {
            formData.append("images[]", images[i]);
        }

        try {
            await axios.post("http://localhost:8000/api/posts", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });
            navigate("/"); // Vrati korisnika na početnu nakon uspešnog kreiranja
        } catch (err) {
            setError("Greška pri kreiranju posta.");
        }
    };

    return (
        <div className="page-shell">
            <div className="page-card narrow">
                <div className="page-header">
                    <h1>Kreiraj novi post</h1>
                    <p>Popuni formu i podeli svoje iskustvo sa zajednicom.</p>
                </div>
                <form className="form-grid" onSubmit={handleSubmit}>
                    <div className="form-field">
                        <span>Opis posta</span>
                        <textarea
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            required
                            placeholder="Napiši nešto o svom automobilu, iskustvu ili događaju..."
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
                        <button type="button" className="btn ghost" onClick={() => navigate("/")}>Otkaži</button>
                    </div>
                </form>
            </div>
        </div>
    );
}