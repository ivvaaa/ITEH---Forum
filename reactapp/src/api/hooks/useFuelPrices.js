import { useCallback, useEffect, useMemo, useState } from "react";

const ENDPOINT = "https://fueleconomy.gov/ws/rest/fuelprices";

const LABELS = {
  regular: "Regular",
  midgrade: "Midgrade",
  premium: "Premium",
  diesel: "Diesel",
  e85: "E85",
  electric: "Elektricno (kWh)",
  lpg: "LPG",
  cng: "CNG",
};

const ORDER = ["regular", "midgrade", "premium", "diesel", "e85", "electric"];

const resolveUnits = (key) => {
  if (key === "electric") {
    return "USD/kWh";
  }
  return "USD/gal";
};

const formatTimestamp = (date) => {
  try {
    return date.toLocaleDateString("sr-RS", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch (_) {
    return date.toISOString();
  }
};

const parseFuelPricesXml = (xmlString, fetchedAt) => {
  const extractValue = (key, parserRoot) => {
    if (parserRoot) {
      const node = parserRoot.getElementsByTagName(key)[0];
      if (node && node.textContent) {
        return Number(node.textContent.trim());
      }
    }

    const regex = new RegExp(`<${key}>([^<]+)</${key}>`, 'i');
    const match = xmlString.match(regex);
    if (match && match[1]) {
      return Number(match[1].trim());
    }

    return NaN;
  };

  let root = null;

  if (typeof window !== 'undefined' && window.DOMParser) {
    const parser = new window.DOMParser();
    const doc = parser.parseFromString(xmlString, 'application/xml');
    root = doc.getElementsByTagName('fuelPrices')[0] || null;
  }

  const entries = ORDER.map((key) => {
    const value = extractValue(key, root);
    if (Number.isNaN(value)) {
      return null;
    }

    return {
      id: key,
      label: LABELS[key] || key,
      latest: {
        value,
        units: resolveUnits(key),
        updatedAt: formatTimestamp(fetchedAt),
      },
    };
  }).filter(Boolean);

  return entries;
};

export default function useFuelPrices() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(ENDPOINT, {
        headers: {
          Accept: "application/xml",
        },
        mode: "cors",
      });

      if (!response.ok) {
        throw new Error(`API error ${response.status}`);
      }

      const xml = await response.text();
      const fetchedAt = new Date();
      const entries = parseFuelPricesXml(xml, fetchedAt);

      if (entries.length === 0) {
        throw new Error("Nema dostupnih podataka o cenama goriva.");
      }

      setData(entries);
    } catch (err) {
      console.error("Failed to load fuel prices", err);
      setError(err.message || "Greska pri dohvatanju cena goriva.");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  const refresh = useCallback(() => {
    fetchPrices();
  }, [fetchPrices]);

  return useMemo(
    () => ({
      prices: data,
      loading,
      error,
      refresh,
    }),
    [data, loading, error, refresh]
  );
}
