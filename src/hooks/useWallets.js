// src/hooks/useWallets.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletAPI } from '../services/api';

export const walletKeys = {
  all:    ['wallets'],
  detail: (id) => ['wallets', 'detail', id],
};

export function useWallets(options = {}) {
  return useQuery({
    queryKey: walletKeys.all,
    queryFn:  walletAPI.getAll,
    select:   (res) => res.data ?? [],
    staleTime: 60_000,
    ...options,
  });
}

export function useWallet(id, options = {}) {
  return useQuery({
    queryKey: walletKeys.detail(id),
    queryFn:  () => walletAPI.getById(id),
    select:   (res) => res.data,
    enabled:  !!id,
    ...options,
  });
}

export function useCreateWallet(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    // mutationFn mengembalikan res.data langsung
    // sehingga mutateAsync() → wallet baru { id, name, balance, ... }
    mutationFn: async (payload) => {
      const res = await walletAPI.create(payload);
      return res.data;
    },
    onSuccess: (wallet) => {
      qc.invalidateQueries({ queryKey: walletKeys.all });
      options.onSuccess?.(wallet);
    },
    onError: options.onError,
  });
}

export function useUpdateWallet(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => walletAPI.update(id, payload),
    onSuccess: (res) => {
      // BUG 1 FIX: invalidate semua query yang mengandung data wallet.
      // Transaksi menyimpan wallet_name, dashboard menyimpan total balance —
      // semuanya harus di-refresh agar tidak tampil data lama.
      qc.invalidateQueries({ queryKey: walletKeys.all });
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      if (res?.data?.id) {
        qc.removeQueries({ queryKey: walletKeys.detail(res.data.id) });
      }
      options.onSuccess?.(res?.data);
    },
    onError: options.onError,
  });
}

export function useDeleteWallet(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: walletAPI.delete,
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: walletKeys.all });
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.removeQueries({ queryKey: walletKeys.detail(id) });
      options.onSuccess?.(id);
    },
    onError: options.onError,
  });
}