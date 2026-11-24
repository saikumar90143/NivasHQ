"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyEmailAction } from "@/actions/verify.actions";
import { Button } from "@/components/ui/button";
import { Loader2, MailCheck, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      router.push("/register");
    }
  }, [email, router]);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    // Handle paste
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split("");
      pasted.forEach((char, i) => {
        if (index + i < 6) newOtp[index + i] = char;
      });
      setOtp(newOtp);
      // Focus last filled input
      const focusIndex = Math.min(index + pasted.length, 5);
      inputRefs.current[focusIndex]?.focus();
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    
    if (code.length !== 6) {
      toast.error("Please enter the full 6-digit code.");
      return;
    }
    
    if (!email) return;

    setIsLoading(true);
    const result = await verifyEmailAction(email, code);
    setIsLoading(false);

    if (result.success) {
      toast.success("Email verified successfully! You can now log in.");
      router.push("/login");
    } else {
      toast.error(result.error || "Verification failed. Please try again.");
    }
  };

  if (!email) return null;

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
      <div className="flex justify-center mb-6">
        <div className="h-16 w-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
          <MailCheck size={32} />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">Check your email</h2>
      <p className="text-center text-slate-500 mb-8">
        We've sent a 6-digit verification code to <br />
        <span className="font-semibold text-slate-900">{email}</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex justify-between gap-2">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => { inputRefs.current[idx] = el }}
              type="text"
              maxLength={6}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-12 h-14 text-center text-2xl font-bold border-2 border-slate-200 rounded-lg focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              required
            />
          ))}
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 text-lg bg-[#0f172a] hover:bg-[#0f172a]/90" 
          disabled={isLoading || otp.join("").length !== 6}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : null}
          Verify Email
        </Button>
      </form>
      
      <p className="mt-6 text-center text-sm text-slate-500">
        Didn't receive the code?{" "}
        <Link href="/register" className="text-indigo-600 font-semibold hover:underline">
          Sign up again
        </Link>
      </p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[#0f172a] -skew-y-6 transform origin-top-left scale-110 -translate-y-1/2 opacity-5 pointer-events-none" />
      
      <div className="relative z-10">
        <Suspense fallback={
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        }>
          <VerifyEmailForm />
        </Suspense>
      </div>
    </div>
  );
}
