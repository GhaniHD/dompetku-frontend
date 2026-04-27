// src/hooks/useProfile.js
import { useState, useCallback, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../config/axios';
import { profileAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext'; 

const PROFILE_QUERY_KEY = ['profile'];
const PROFILE_STORAGE_KEY = 'dompetku_profile';
const AVATAR_STORAGE_KEY = 'dompetku_avatar';

// ─── Helpers localStorage ────────────────────────────────────────────────────
const saveProfileLocal = (profile) => {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch {
    console.warn('Gagal menyimpan profil ke localStorage');
  }
};

const loadProfileLocal = () => {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveAvatarLocal = (dataUrl) => {
  try {
    localStorage.setItem(AVATAR_STORAGE_KEY, dataUrl);
  } catch {
    console.warn('Avatar terlalu besar untuk localStorage');
  }
};

const loadAvatarLocal = () => localStorage.getItem(AVATAR_STORAGE_KEY) || null;

// ─── Hook Utama ──────────────────────────────────────────────────────────────
export const useProfile = () => {
  const queryClient = useQueryClient();
  const { updateUser } = useContext(AuthContext); // ✅ ambil updateUser

  const [avatarPreview, setAvatarPreview] = useState(loadAvatarLocal);
  const [successMsg, setSuccessMsg] = useState(null);

  const flash = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Fetch Profile dengan TanStack Query
  const {
    data: profile,
    isLoading: loading,
    error: queryError,
    refetch: fetchProfile,
  } = useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: async () => {
      try {
        const res = await profileAPI.get();
        const data = res.data ?? res;
        saveProfileLocal(data);
        return data;
      } catch {
        const local = loadProfileLocal();
        if (local) {
          throw new Error('Offline — menampilkan data tersimpan');
        }
        throw new Error('Gagal mengambil profil');
      }
    },
    initialData: loadProfileLocal(),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 menit
  });

  // Mutation: Update Profile
  const updateProfileMutation = useMutation({
    mutationFn: ({ name, email }) => profileAPI.update({ name, email }),
    onSuccess: (res) => {
      const updated = res.data ?? res;
      queryClient.setQueryData(PROFILE_QUERY_KEY, updated);
      saveProfileLocal(updated);

      // ✅ Update AuthContext agar nama tampil di sidebar
      updateUser({ name: updated.name, email: updated.email });

      flash('Profil berhasil disimpan');
    },
  });

  // Mutation: Change Password
  const changePasswordMutation = useMutation({
    mutationFn: ({ oldPassword, newPassword, confirmPassword }) => {
      if (newPassword !== confirmPassword) throw new Error('Konfirmasi password tidak cocok');
      if (newPassword.length < 8) throw new Error('Password minimal 8 karakter');
      return profileAPI.changePassword(oldPassword, newPassword);
    },
    onSuccess: () => flash('Password berhasil diubah'),
    onError: () => {
      // Error akan ditangani di komponen
    },
  });

  // Mutation: Upload Avatar
  // Mutation: Upload Avatar — FIXED
const uploadAvatarMutation = useMutation({
    mutationFn: async (file) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) throw new Error('Format gambar tidak didukung');
      if (file.size > 2 * 1024 * 1024) throw new Error('Ukuran gambar maksimal 2 MB');

      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = (e) => resolve(e.target.result);
        reader.onerror = ()  => reject(new Error('Gagal membaca file'));
        reader.readAsDataURL(file);
      });

      setAvatarPreview(dataUrl);
      saveAvatarLocal(dataUrl);

      const res = await profileAPI.uploadAvatar(file);
      return res.data ?? res;
    },
    onSuccess: (updated) => {
  const rawUrl =
    updated?.avatar_url ||
    updated?.data?.avatar_url ||
    null;

  if (rawUrl) {
    // ✅ Strip /api karena uploads ada di root server
    const BASE_URL = (axiosInstance.defaults.baseURL || '')
      .replace(/\/api$/, '')
      .replace(/\/$/, '');

    const fullUrl = rawUrl.startsWith('http')
      ? rawUrl
      : `${BASE_URL}${rawUrl}`;

    const cacheBusted = `${fullUrl}?t=${Date.now()}`;

    setAvatarPreview(cacheBusted);
    saveAvatarLocal(cacheBusted);

    queryClient.setQueryData(PROFILE_QUERY_KEY, (old) => ({
      ...old,
      avatar_url: cacheBusted,
    }));

    updateUser({ avatar_url: cacheBusted });
  }

  flash('Foto profil berhasil diperbarui');
},
  });

  // Mutation: Delete Account
  const deleteAccountMutation = useMutation({
    mutationFn: () => profileAPI.deleteAccount?.(),
    onSuccess: () => {
      localStorage.clear();
      queryClient.removeQueries({ queryKey: PROFILE_QUERY_KEY });
      setAvatarPreview(null);
    },
    onError: () => {
      // Error ditangani di komponen
    },
  });

  const clearMessages = useCallback(() => {
    setSuccessMsg(null);
  }, []);

  return {
    profile,
    avatarPreview,
    loading,
    saving: updateProfileMutation.isPending || changePasswordMutation.isPending,
    uploadingAvatar: uploadAvatarMutation.isPending,
    error: queryError?.message || 
           updateProfileMutation.error?.message || 
           changePasswordMutation.error?.message,
    successMsg,
    fetchProfile: () => fetchProfile(),
    updateProfile: updateProfileMutation.mutateAsync,
    changePassword: changePasswordMutation.mutateAsync,
    uploadAvatar: uploadAvatarMutation.mutateAsync,
    deleteAccount: deleteAccountMutation.mutateAsync,
    clearMessages,
  };
};