// src/hooks/useReports.js
import { useQuery } from '@tanstack/react-query';
import { reportAPI } from '../services/api';

export const reportKeys = {
  all:     ['reports'],
  monthly: (month, year) => ['reports', 'monthly', month, year],
  yearly:  (year)        => ['reports', 'yearly',  year],
};

// GET /api/reports?month=&year=
export function useMonthlyReport(month, year, options = {}) {
  return useQuery({
    queryKey: reportKeys.monthly(month, year),
    queryFn:  () => reportAPI.getMonthly(year, month),
    select:   (res) => res.data ?? null,
    enabled:  !!month && !!year,
    staleTime: 60_000,
    ...options,
  });
}

// GET /api/reports/yearly?year=
export function useYearlyReport(year, options = {}) {
  return useQuery({
    queryKey: reportKeys.yearly(year),
    queryFn:  () => reportAPI.getYearly(year),
    select:   (res) => res.data ?? null,
    enabled:  !!year,
    staleTime: 60_000,
    ...options,
  });
}