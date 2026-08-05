"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { apiClient } from "@/lib/api-client";
import { AuthUser } from "@/types";

export function useRequireAuth() {
  const router = useRouter();
  const { accessToken, user, setAuth, clearAuth } = useAuthStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      if (accessToken) {
        setChecked(true);
        return;
      }
      try {
        const res = await apiClient.post<{ accessToken: string; user: AuthUser }>("/auth/refresh");
        if (!cancelled) {
          setAuth(res.data.accessToken, res.data.user);
          setChecked(true);
        }
      } catch {
        if (!cancelled) {
          clearAuth();
          router.replace("/login");
        }
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { user, ready: checked && !!useAuthStore.getState().accessToken };
}
