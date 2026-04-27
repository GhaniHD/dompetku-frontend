// src/hooks/useAnalysis.js
import { useState, useEffect, useCallback } from 'react';
import { analysisService } from '../services/analysisService';

export function useAnalysis(year) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async () => {
    if (!year) return;
    setLoading(true);
    setError(null);
    try {
      const res = await analysisService.getAnalysis(year);
      const d   = res.data?.data ?? res.data;
      setData(d);
    } catch (e) {
      setError(e?.response?.data?.message ?? 'Gagal mengambil data analisis');
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}