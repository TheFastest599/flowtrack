import customStorage from "./customStorage";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import auth from "@/lib/api/auth";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loggedIn: false,
      isLoading: false,
      error: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      login: async (email, password) => {
        set({ loggedIn: false, isLoading: true, error: null });
        try {
          const response = await auth.login({ email, password });
          // Assuming response matches the format: { access_token, token_type, user }
          set({
            user: response.user,
            token: response.access_token,
            loggedIn: true,
            isLoading: false,
            error: null,
          });
          return response;
        } catch (error) {
          // Catch the response if available (e.g., from Axios error)
          const errorMessage =
            error.response?.data?.detail ||
            error.response?.data?.message ||
            error.message ||
            "Login failed";
          set({
            error: errorMessage,
            isLoading: false,
          });
          return null; // Or throw error if preferred
        }
      },
      register: async (userData) => {
        set({ loggedIn: false, isLoading: true, error: null });
        try {
          const response = await auth.register(userData);
          // Assuming response matches the format: { access_token, token_type, user }
          set({
            user: response.user,
            token: response.access_token,
            loggedIn: true,
            isLoading: false,
            error: null,
          });
          return response;
        } catch (error) {
          const errorMessage =
            error.response?.data?.detail ||
            error.response?.data?.message ||
            error.message ||
            "Login failed";
          set({
            error: errorMessage,
            isLoading: false,
          });
        }
      },
      refreshToken: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await auth.refreshToken();
          if (response.access_token) {
            set({
              token: response.access_token,
              loggedIn: true,
              isLoading: false,
            });
            return true;
          }
          return false;
        } catch (error) {
          const errorMessage =
            error.response?.data?.detail ||
            error.response?.data?.message ||
            error.message ||
            "Login failed";
          set({
            loggedIn: false,
            user: null,
            token: null,
            error: null,
            isLoading: false,
          });
          return false;
        }
      },
      logout: async () => {
        set({ loggedIn: false, user: null, token: null, error: null });
        try {
          await auth.logout();
        } catch (error) {
          const errorMessage =
            error.response?.data?.detail ||
            error.response?.data?.message ||
            error.message ||
            "Login failed";
          console.error("Logout failed:", errorMessage);
        }
      },
    }),
    {
      name: "auth", // Unique name within the merged storage
      storage: customStorage, // Use custom storage
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        loggedIn: state.loggedIn,
      }), // Only persist token and user
    }
  )
);
