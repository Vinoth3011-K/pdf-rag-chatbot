"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BookMarked, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { AuthUser } from "@/types";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      const res = await apiClient.post<{ accessToken: string; refreshToken: string; user: AuthUser }>("/auth/login", values);
      setAuth(res.data.accessToken, res.data.refreshToken, res.data.user);
      router.push("/dashboard");
    } catch (err) {
      setServerError(err instanceof ApiClientError ? err.message : "Something went wrong");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 justify-center text-ink-800">
          <BookMarked size={22} className="text-highlight-strong" />
          <span className="font-display italic text-2xl">Marginal</span>
        </div>

        <div className="bg-paper-card border border-ink-100 rounded-card shadow-card p-7">
          <h1 className="font-display text-xl text-ink-900 mb-1">Admin sign in</h1>
          <p className="text-sm text-ink-400 mb-6">Manage the knowledge base and review usage.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="admin@example.com" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            {serverError && (
              <p className="text-sm text-destructive bg-red-50 rounded-card px-3 py-2">{serverError}</p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
