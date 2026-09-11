import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { apiPost, ApiError } from "@/lib/api";
import type { AdminUser } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLogin() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiPost<AdminUser>("/auth/login", { email, password });
      qc.clear();
      navigate("/admin");
    } catch (err) {
      toast.error(err instanceof ApiError && err.status === 401 ? "بيانات الدخول غير صحيحة" : "تعذر تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 min-h-screen flex items-start justify-center" data-testid="admin-login-page">
      <form
        onSubmit={submit}
        className="gold-corners w-full max-w-md mx-4 rounded-lg border border-[#1E293B] bg-[#0D141D] p-10 space-y-6 scanlines relative"
        data-testid="admin-login-form"
      >
        <div className="text-center mb-2">
          <ShieldCheck className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
          <h1 className="font-heading font-extrabold text-2xl text-white">لوحة القيادة والسيطرة</h1>
          <p className="text-sm text-[#94A3B8] mt-2">دخول الإدارة فقط</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-email" className="text-[#CBD5E1]">البريد الإلكتروني</Label>
          <Input id="admin-email" type="email" required data-testid="admin-email-input"
            value={email} onChange={(e) => setEmail(e.target.value)}
            className="bg-[#0A1017] border-[#273549] text-white" dir="ltr" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-password" className="text-[#CBD5E1]">كلمة المرور</Label>
          <Input id="admin-password" type="password" required data-testid="admin-password-input"
            value={password} onChange={(e) => setPassword(e.target.value)}
            className="bg-[#0A1017] border-[#273549] text-white" dir="ltr" />
        </div>
        <button
          type="submit"
          disabled={loading}
          data-testid="admin-login-submit"
          className="w-full py-3.5 rounded-md bg-[#009E49] hover:bg-[#00b855] disabled:opacity-50 text-white font-bold transition-colors"
        >
          {loading ? "جاري التحقق..." : "دخول"}
        </button>
      </form>
    </div>
  );
}
