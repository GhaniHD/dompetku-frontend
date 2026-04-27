// src/hooks/useCategories.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryAPI } from '../services/api';

export const categoryKeys = {
  all:    ['categories'],
  byType: (type) => ['categories', type],
  detail: (id)   => ['categories', 'detail', id],
};

export function useCategories(type = null, options = {}) {
  return useQuery({
    queryKey: type ? categoryKeys.byType(type) : categoryKeys.all,
    queryFn:  () => categoryAPI.getAll(type),
    select:   (res) => res.data ?? [],
    staleTime: 300_000,
    ...options,
  });
}

export function useCreateCategory(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    // mutationFn mengembalikan res.data langsung
    // sehingga mutateAsync() → category baru { id, name, type, ... }
    mutationFn: async (payload) => {
      const res = await categoryAPI.create(payload);
      return res.data;
    },
    onSuccess: (category) => {
      qc.invalidateQueries({ queryKey: categoryKeys.all });
      options.onSuccess?.(category);
    },
    onError: options.onError,
  });
}

export function useUpdateCategory(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => categoryAPI.update(id, payload),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: categoryKeys.all });
      options.onSuccess?.(res.data);
    },
    onError: options.onError,
  });
}

export function useDeleteCategory(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoryAPI.delete,
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: categoryKeys.all });
      qc.removeQueries({ queryKey: categoryKeys.detail(id) });
      options.onSuccess?.(id);
    },
    onError: options.onError,
  });
}