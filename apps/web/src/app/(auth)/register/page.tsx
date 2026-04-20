"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, Zap, ArrowRight } from "lucide-react";
import { RegisterSchema, type RegisterInput } from "@antigravity/types";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/store";

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      const res = await api.post("/auth/register", data);
      const { user, org, tokens } = res.data.data;

      localStorage.setItem("accessToken", tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken);
      setAuth({ user, org, role: "OWNER", tokens });

      toast.success("Account created! Setting up your workspace...");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-brand-700/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-brand-900/15 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-glow">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="font-display font-bold text-2xl text-white">Antigravity</span>
        </div>

        <div className="card p-8 animate-slide-in-up">
          <h1 className="text-2xl font-bold font-display text-white mb-1">Create your account</h1>
          <p className="text-slate-500 text-sm mb-8">Start managing your fleet in minutes</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Your Name</label>
                <input {...register("name")} placeholder="Arjun Reddy" className={`input ${errors.name ? "input-error" : ""}`} />
                {errors.name && <p className="text-danger text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div className="col-span-2">
                <label className="label">Company Name</label>
                <input {...register("orgName")} placeholder="Hyderabad Travels" className={`input ${errors.orgName ? "input-error" : ""}`} />
                {errors.orgName && <p className="text-danger text-xs mt-1">{errors.orgName.message}</p>}
              </div>
            </div>

            <div>
              <label className="label">Email Address</label>
              <input {...register("email")} type="email" placeholder="you@company.com" className={`input ${errors.email ? "input-error" : ""}`} />
              {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Mobile Number</label>
              <input {...register("phone")} type="tel" placeholder="9876543210" className={`input ${errors.phone ? "input-error" : ""}`} />
              {errors.phone && <p className="text-danger text-xs mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  className={`input pr-10 ${errors.password ? "input-error" : ""}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-danger text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-3 mt-2">
              {isSubmitting
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <>Create Account <ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-bg-border text-center">
            <p className="text-slate-500 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-brand-400 hover:text-brand-300 transition-colors font-medium">Sign in</Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-4">
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
