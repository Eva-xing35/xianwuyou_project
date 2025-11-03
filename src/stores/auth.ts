import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { login as apiLogin, register as apiRegister, type AuthResponse } from '../services/api';
import { getStoredToken, setStoredToken } from '../services/http';

interface Credentials {
  phone: string;
  password: string;
}

const DEMO_PHONE = import.meta.env.VITE_DEMO_PHONE as string | undefined;
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD as string | undefined;

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(getStoredToken());
  const user = ref<AuthResponse['user'] | null>(null);
  const loading = ref(false);

  const isAuthenticated = computed(() => Boolean(token.value));

  const setSession = (payload: AuthResponse) => {
    token.value = payload.token;
    user.value = payload.user;
    setStoredToken(payload.token);
  };

  const clearSession = () => {
    token.value = null;
    user.value = null;
    setStoredToken(null);
  };

  const loginWithPassword = async ({ phone, password }: Credentials) => {
    loading.value = true;
    try {
      const session = await apiLogin({ phone, password });
      setSession(session);
      return session;
    } finally {
      loading.value = false;
    }
  };

  const registerIfNeeded = async ({ phone, password }: Credentials) => {
    try {
      await apiRegister({ phone, password });
    } catch (error) {
      // Ignore duplicate registration errors
      console.warn('[auth] register skipped:', (error as Error).message);
    }
  };

  const ensureDemoSession = async () => {
    if (token.value || !DEMO_PHONE || !DEMO_PASSWORD) return;
    await registerIfNeeded({ phone: DEMO_PHONE, password: DEMO_PASSWORD });
    await loginWithPassword({ phone: DEMO_PHONE, password: DEMO_PASSWORD });
  };

  return {
    token,
    user,
    loading,
    isAuthenticated,
    loginWithPassword,
    clearSession,
    ensureDemoSession
  };
});
