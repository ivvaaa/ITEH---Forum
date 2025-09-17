import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const FEED_URLS = [
  "https://www.autoblog.com/rss.xml",
  "https://www.motortrend.com/feed/",
  "https://www.carscoops.com/feed/",
];

const PROXY_PREFIX = "https://api.allorigins.win/raw?url=";

const stripHtml = (input = "") => input.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const truncate = (text, max = 200) => {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
};

const parseDate = (value) => {
  if (!value) return null;
  const ts = Date.parse(value);
  if (Number.isNaN(ts)) {
    return null;
  }
  return new Date(ts).toISOString();
};

const pickText = (node, selectors) => {
  for (const selector of selectors) {
    const found = node.querySelector(selector);
    if (found && found.textContent) {
      const text = found.textContent.trim();
      if (text) return text;
    }
  }
  return "";
};

const extractArticles = (xmlString, fallbackSource) => {
  if (typeof window === "undefined" || !window.DOMParser) {
    return [];
  }

  try {
    const parser = new window.DOMParser();
    const doc = parser.parseFromString(xmlString, "text/xml");
    const items = doc.querySelectorAll("item, entry");

    return Array.from(items)
      .map((item) => {
        const linkEl = item.querySelector("link");
        let url = "";
        if (linkEl) {
          url = linkEl.getAttribute("href") || linkEl.textContent?.trim() || "";
        }

        const title = pickText(item, ["title"]);
        const summary = pickText(item, ["description", "summary", "content"]);
        const publishedRaw = pickText(item, [
          "pubDate",
          "published",
          "updated",
          "dc\\:date",
        ]);
        const creator =
          pickText(item, ["author", "creator", "dc\\:creator"]) || fallbackSource;

        if (!title || !url) {
          return null;
        }

        let host = fallbackSource;
        try {
          host = new URL(url).hostname.replace(/^www\./, "");
        } catch (_) {
          // ignore invalid URL
        }

        return {
          id: `${host}-${title}`,
          title,
          url,
          summary: truncate(stripHtml(summary), 220),
          published_at: parseDate(publishedRaw),
          source: creator || host,
        };
      })
      .filter(Boolean);
  } catch (error) {
    console.error("Failed to parse automotive feed", error);
    return [];
  }
};

export default function useAutoNews() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const requestIdRef = useRef(0);

  const fetchNews = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setLoading(true);
    setError("");

    const aggregated = [];

    for (const feedUrl of FEED_URLS) {
      try {
        const response = await fetch(`${PROXY_PREFIX}${encodeURIComponent(feedUrl)}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const xml = await response.text();
        const host = new URL(feedUrl).hostname.replace(/^www\./, "");
        aggregated.push(...extractArticles(xml, host));
      } catch (err) {
        console.warn(`Failed to load feed ${feedUrl}`, err);
      }
    }

    if (requestId !== requestIdRef.current) {
      return;
    }

    if (aggregated.length === 0) {
      setArticles([]);
      setError("Trenutno nije moguce dohvatiti vesti iz automobilskog sveta.");
      setLoading(false);
      return;
    }

    const deduped = Array.from(
      new Map(aggregated.map((article) => [article.url, article])).values()
    );

    deduped.sort((a, b) => {
      const aDate = a.published_at ? Date.parse(a.published_at) : 0;
      const bDate = b.published_at ? Date.parse(b.published_at) : 0;
      return bDate - aDate;
    });

    if (requestId !== requestIdRef.current) {
      return;
    }

    setArticles(deduped.slice(0, 9));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNews();

    return () => {
      requestIdRef.current += 1;
    };
  }, [fetchNews]);

  const refresh = useCallback(() => {
    fetchNews();
  }, [fetchNews]);

  return useMemo(
    () => ({
      articles,
      loading,
      error,
      refresh,
    }),
    [articles, loading, error, refresh]
  );
}
