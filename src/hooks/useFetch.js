// ce hook gere les donnees recuperees, le chargement et les erreurs
import { useState, useEffect } from "react";

export default function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");

        const res = await fetch(url, {
          signal: abortController.signal,
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const responseData = await res.json();
        console.log(`Données reçues de ${url}:`, responseData);
        setData(responseData);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(`Erreur lors du fetch de ${url}:`, err.message);
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => abortController.abort();
  }, [url]);

  return { data, loading, error };
}