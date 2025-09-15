import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CreatePost() {
    const [content, setContent] = useState("");
    const [carId, setCarId] = useState("");
    const [images, setImages] = useState([]);
    const [other, setOther] = useState("");
    const [cars, setCars] = useState([]);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Učitaj automobile iz baze
    useEffect(() => {
        const token = sessionStorage.getItem("auth_token") || localStorage.getItem("access_token");
        axios
            .get("http://localhost:8000/api/cars", {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then(res => setCars(res.data.data || res.data))
            .catch(err => {
                console.error(err);
                setCars([]);
            });
    }, []);

    const handleImageChange = (e) => {
        setImages([...e.target.files]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        const token = sessionStorage.getItem("auth_token") || localStorage.getItem("access_token");
        const formData = new FormData();
        formData.append("content", content);
        formData.append("car_id", carId);
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
        <div style={{ maxWidth: 500, margin: "30px auto" }}>
            <h2>Kreiraj novi post</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Opis:</label>
                    <textarea value={content} onChange={e => setContent(e.target.value)} required />
                </div>
                <div>
                    <label>Automobil:</label>
                    <select value={carId} onChange={e => setCarId(e.target.value)} required>
                        <option value="">Izaberi automobil</option>
                        {cars.map(car => (
                            <option key={car.id} value={car.id}>{car.make} {car.model} ({car.year})</option>
                        ))}
                    </select>
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
                <button type="submit">Sačuvaj</button>
            </form>
        </div>
    );
}