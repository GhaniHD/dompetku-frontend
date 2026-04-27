// src/hooks/useBudgets.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetAPI } from '../services/api';

export const budgetKeys = {
  all:    ['budgets'],
  list:   (filter) => ['budgets', 'list', filter],
  detail: (id)     => ['budgets', 'detail', id],
};

// GET /api/budgets?month=&year=
export function useBudgets(filter = {}, options = {}) {
  return useQuery({
    queryKey: budgetKeys.list(filter),
    queryFn:  () => budgetAPI.getAll(filter),
    select:   (res) => res.data ?? { budgets: [], total_budget: 0, total_spent: 0, total_remain: 0 },
    staleTime: 30_000,
    ...options,
  });
}

// GET /api/budgets/:id
export function useBudget(id, options = {}) {
  return useQuery({
    queryKey: budgetKeys.detail(id),
    queryFn:  () => budgetAPI.getById(id),
    select:   (res) => res.data,
    enabled:  !!id,
    ...options,
  });
}

// POST /api/budgets
export function useCreateBudget(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: budgetAPI.create,
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: budgetKeys.all });
      options.onSuccess?.(res.data);
    },
    onError: options.onError,
  });
}

// PUT /api/budgets/:id
export function useUpdateBudget(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => budgetAPI.update(id, payload),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: budgetKeys.all });
      if (res.data?.id) qc.setQueryData(budgetKeys.detail(res.data.id), res);
      options.onSuccess?.(res.data);
    },
    onError: options.onError,
  });
}

// DELETE /api/budgets/:id
export function useDeleteBudget(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: budgetAPI.delete,
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: budgetKeys.all });
      qc.removeQueries({ queryKey: budgetKeys.detail(id) });
      options.onSuccess?.(id);
    },
    onError: options.onError,
  });
}

// POST /api/budgets/copy
export function useCopyBudget(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: budgetAPI.copy,
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: budgetKeys.all });
      options.onSuccess?.(res.data);
    },
    onError: options.onError,
  });
}