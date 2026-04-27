// src/hooks/useTransactions.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionAPI } from '../services/api';

export const txKeys = {
  all:    ['transactions'],
  list:   (filter) => ['transactions', 'list', filter],
  detail: (id)     => ['transactions', 'detail', id],
};

export function useTransactions(filter = {}, options = {}) {
  return useQuery({
    queryKey: txKeys.list(filter),
    queryFn:  () => transactionAPI.getAll(filter),
    select:   (res) => res.data ?? [],
    staleTime: 30_000,
    ...options,
  });
}

export function useTransaction(id, options = {}) {
  return useQuery({
    queryKey: txKeys.detail(id),
    queryFn:  () => transactionAPI.getById(id),
    select:   (res) => res.data,
    enabled:  !!id,
    ...options,
  });
}

export function useCreateTransaction(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: transactionAPI.create,
    onSuccess: (res) => {
      // ✅ TAMBAHKAN: invalidate wallets karena saldo berubah
      qc.invalidateQueries({ queryKey: txKeys.all });
      qc.invalidateQueries({ queryKey: ['wallets'] });
      qc.invalidateQueries({ queryKey: ['reports'] }); // optional: agar report juga update
      options.onSuccess?.(res.data);
    },
    onError: options.onError,
  });
}

export function useUpdateTransaction(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => transactionAPI.update(id, payload),
    onSuccess: (res) => {
      // ✅ TAMBAHKAN: invalidate wallets & reports
      qc.invalidateQueries({ queryKey: txKeys.all });
      qc.invalidateQueries({ queryKey: ['wallets'] });
      qc.invalidateQueries({ queryKey: ['reports'] });
      if (res.data?.id) qc.setQueryData(txKeys.detail(res.data.id), res);
      options.onSuccess?.(res.data);
    },
    onError: options.onError,
  });
}

export function useDeleteTransaction(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: transactionAPI.delete,
    onSuccess: (_, id) => {
      // ✅ TAMBAHKAN: invalidate wallets & reports
      qc.invalidateQueries({ queryKey: txKeys.all });
      qc.invalidateQueries({ queryKey: ['wallets'] });
      qc.invalidateQueries({ queryKey: ['reports'] });
      qc.removeQueries({ queryKey: txKeys.detail(id) });
      options.onSuccess?.(id);
    },
    onError: options.onError,
  });
}