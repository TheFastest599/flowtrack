"use client";

import useRefreshToken from "@/components/hooks/useRefreshToken";

export default function RefreshTokenWrapper() {
  useRefreshToken(); // Call the hook here
  return null; // This component renders nothing
}
