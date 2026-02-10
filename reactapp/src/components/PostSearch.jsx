import { useEffect, useState } from "react";
import axios from "axios";

function useDebounce(value, ms = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

export default function PostSearch() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("relevance");
  const [hits, setHits] = useState([]);
  const [loading, setLoading] = useState(false);

  const dq = useDebounce(q, 300);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      // Show results if query has content OR category is selected
      if (!dq.trim() && !category) {
        setHits([]);
        return;
      }

      setLoading(true);
      try {
        console.log("Searching with:", { q: dq, category, sort });
        const res = await axios.get("http://localhost:8000/api/search/posts", {
          params: { q: dq, category, sort },
        });
        console.log("Search response:", res.data);
        if (!cancelled) setHits(res.data.hits || []);
      } catch (error) {
        if (!cancelled) console.error("Search error:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => { cancelled = true; };
  }, [dq, category, sort]);

  // Small helper to safely render highlights (only because WE control tags)
  const renderHighlighted = (html) => (
    <span dangerouslySetInnerHTML={{ __html: html }} />
  );

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h2 style={{ marginBottom: 8 }}>Smart Search (Meilisearch)</h2>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault();
        }}
        placeholder='Try: "bmw e90 coolent"'
        style={{ width: "100%", padding: 12, fontSize: 16 }}
      />

      <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
        <CategoryChips selected={category} onSelect={setCategory} />

        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="relevance">Relevance</option>
          <option value="newest">Newest</option>
        </select>

        {loading && <span>Loading...</span>}
      </div>

      <div style={{ marginTop: 12 }}>
        {hits.length === 0 && (dq.trim() || category) && !loading && (
          <div style={{ opacity: 0.7 }}>No results.</div>
        )}

        {hits.map((hit) => (
          <div key={hit.id} style={{
            border: "1px solid #ddd",
            borderRadius: 10,
            padding: 12,
            marginBottom: 10
          }}>
            <div style={{ fontSize: 14, opacity: 0.8 }}>
              Category: {hit.categories}
              {" • "}
              {hit.created_at ? new Date(hit.created_at * 1000).toLocaleString() : ""}
            </div>

            <div style={{ marginTop: 6, fontSize: 16 }}>
              {hit._formatted?.content
                ? renderHighlighted(hit._formatted.content)
                : hit.content}
            </div>

            {hit.other && (
              <div style={{ marginTop: 6, opacity: 0.85 }}>
                {hit._formatted?.other ? renderHighlighted(hit._formatted.other) : hit.other}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryChips({ selected, onSelect }) {
  const categories = ["", "elektricni_automobili", "oldtajmeri", "sportski", "odrzavanje_i_popravka"];

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {categories.map((c) => {
        const active = selected === c;
        return (
          <button
            key={c || "all"}
            onClick={() => onSelect(c)}
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              border: "1px solid #ccc",
              background: active ? "#eee" : "white",
              cursor: "pointer"
            }}
          >
            {c ? c.replace(/_/g, ' ') : "All"}
          </button>
        );
      })}
    </div>
  );
}
