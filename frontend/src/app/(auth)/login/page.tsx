"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Sparkles, Loader2, ArrowLeft } from "lucide-react";
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
      setServerError(err instanceof ApiClientError ? err.message : "Invalid email or password");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0d0d0d] text-[#ececec] px-6 relative">
      <div className="w-full max-w-sm">
        <Link href="/" className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft size={14} />
          <span>Back to home</span>
        </Link>

        <div className="flex items-center gap-2.5 mb-8 justify-center text-white">
          <div className="h-8 w-8 rounded-lg bg-[#10a37f] flex items-center justify-center text-white shadow-glow">
            <Sparkles size={18} />
          </div>
          <span className="font-semibold tracking-tight text-2xl">Marginal <span className="text-xs text-neutral-400 font-normal">AI</span></span>
        </div>

        <div className="bg-[#181818] border border-[#2e2e2e] rounded-2xl shadow-2xl p-7">
          <h1 className="text-xl font-semibold text-white mb-1">Admin Sign In</h1>
          <p className="text-xs text-neutral-400 mb-6">Manage knowledge base PDFs and system status.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-neutral-300 text-xs">Email</Label>
              <Input id="email" type="email" placeholder="admin@example.com" {...register("email")} />
              {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-neutral-300 text-xs">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
              {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
            </div>

            {serverError && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{serverError}</p>
            )}

            <Button type="submit" className="w-full h-10 mt-2 shadow-glow" disabled={isSubmitting}>
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
