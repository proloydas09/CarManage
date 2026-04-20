"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, Zap, ArrowRight } from "lucide-react";
import { LoginSchema, type LoginInput } from "@antigravity/types";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      const res = await api.post("/auth/login", data);
      const { user, org, role, tokens } = res.data.data;

      localStorage.setItem("accessToken", tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken);
      setAuth({ user, org, role, tokens });

      toast.success(`Welcome back, ${user.name}!`);
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? "Login failed. Check credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-brand-800/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-glow">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="font-display font-bold text-2xl text-white">Antigravity</span>
        </div>

        <div className="card p-8 animate-slide-in-up">
          <h1 className="text-2xl font-bold font-display text-white mb-1">Welcome back</h1>
          <p className="text-slate-500 text-sm mb-8">Sign in to your fleet dashboard</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label">Email address</label>
              <input
                {...register("email")}
                type="email"
                placeholder="admin@demo.com"
                className={`input ${errors.email ? "input-error" : ""}`}
                autoComplete="email"
              />
              {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`input pr-10 ${errors.password ? "input-error" : ""}`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-danger text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-3 mt-2">
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-bg-border text-center">
            <p className="text-slate-500 text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-brand-400 hover:text-brand-300 transition-colors font-medium">
                Create one
              </Link>
            </p>
          </div>

          {/* Demo creds */}
          <div className="mt-4 p-3 bg-bg-elevated rounded-xl border border-bg-border text-center">
            <p className="text-xs text-slate-500">Demo: <span className="font-mono text-slate-300">admin@demo.com</span> / <span className="font-mono text-slate-300">Demo@1234</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
