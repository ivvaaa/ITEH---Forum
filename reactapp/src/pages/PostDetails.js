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
        axios
            .get(`http://127.0.0.1:8000/api/posts/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                setPost(res.data.data || res.data);
                setComments(res.data.data?.comments || res.data.comments || []);
            })
            .catch((err) => {
                console.error(err);
                navigate("/");
            });
    }, [id, navigate]);

    if (!post) return <div>Učitavanje...</div>;

    return (
        <div style={{ maxWidth: 700, margin: "30px auto" }}>
            <button onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>Nazad</button>
            <h2>{post.user?.name || "Nepoznat korisnik"}</h2>
            <p>
                <b>Auto:</b> {post.car?.make} {post.car?.model} ({post.car?.year})
            </p>
            <p>{post.content}</p>
            {post.images && post.images.length > 0 && (
                <div>
                    {post.images.map((img, idx) => (
                        <img key={idx} src={img} alt="slika auta" style={{ width: 200, margin: 5 }} />
                    ))}
                </div>
            )}
            <small>{post.created_at}</small>
            <hr />
            <h4>Komentari:</h4>
            {comments.length === 0 && <p>Nema komentara.</p>}
            {comments.map((c) => (
                <div key={c.id} style={{ borderBottom: "1px solid #ccc", marginBottom: 10 }}>
                    <b>{c.user?.name || "Anonimni korisnik"}:</b>
                    <p>{c.content}</p>
                    <small>{c.created_at}</small>
                </div>
            ))}
        </div>
    );
};

export default PostDetails;