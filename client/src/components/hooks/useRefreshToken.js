"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

const useRefreshToken = () => {
  // Changed to const assignment
  const { refreshToken, hydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    const refresh = async () => {
      try {
        const res = await refreshToken();
        if (!res) {
          console.log("Refresh token failed, redirecting to login");
          router.push("/login");
        }
      } catch (error) {
        // On failure, redirect to login (e.g., invalid or expired refresh token)
        console.log("Refresh token failed, redirecting to login");
        router.push("/login");
      }
    };

    // Run once on startup
    refresh();

    const interval = setInterval(refresh, 14 * 60 * 1000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [hydrated]); // Empty dependencies as discussed

  return null;
};

export default useRefreshToken;
