"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, isLoading, hydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !isLoading) {
      if (!user) {
        // Not logged in, redirect to login
        router.push("/login");
      } else if (requireAdmin && user.role !== "admin") {
        // Logged in but not admin, redirect to unauthorized or home
        router.push("/"); // Or "/dashboard" if you have one
      }
    }
  }, [user, isLoading, hydrated, requireAdmin, router]);

  if (!hydrated || isLoading) {
    // Wait for store to hydrate and check auth
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || (requireAdmin && user.role !== "admin")) {
    // Don't render children if not authorized
    return null;
  }

  // Render children if authorized
  return children;
}
