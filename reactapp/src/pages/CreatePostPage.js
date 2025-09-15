import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CreatePost() {
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
            navigate("/"); // Vrati korisnika na pocetnu nakon uspe�nog kreiranja
        } catch (err) {
            setError("Gre�ka pri kreiranju posta.");
        }
    };

    return (
        <div style={{ maxWidth: 500, margin: "30px auto" }}>
            <h2>Kreiraj novi post</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Opis:</label>
                    <textarea value={content} onChange={e => setContent(e.target.value)} required />
                </div>
                <div>
                    <label>Proizvođač automobila: </label>
                    <input type="text" value={carMake} onChange={e => setCarMake(e.target.value)} required />
                </div>
                <div>
                    <label>Model automobila: </label>
                    <input type="text" value={carModel} onChange={e => setCarModel(e.target.value)} required />
                </div>
                <div>
                    <label>Godiste automobila: </label>
                    <input
                        type="number"
                        min="1950"
                        max="2025"
                        value={carYear}
                        onChange={e => setCarYear(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Slike:</label>
                    <input type="file" multiple accept="image/*" onChange={handleImageChange} />
                </div>
                <div>
                    <label>Dodatno:</label>
                    <input type="text" value={other} onChange={e => setOther(e.target.value)} />
                </div>
                {error && <div style={{ color: "red" }}>{error}</div>}
                <button type="submit">Sacuvaj</button>
            </form>
        </div>
    );
}
