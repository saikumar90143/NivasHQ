"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeOnboardingAction } from "@/actions/onboarding.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, User, UserCircle2, CheckCircle2, Loader2, Home } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

type RoleType = "BUYER" | "AGENT" | "BUILDER" | null;

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [selectedRole, setSelectedRole] = useState<RoleType>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedRole) return;

    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      role: selectedRole,
      companyName: formData.get("companyName") as string,
      licenseNumber: formData.get("licenseNumber") as string,
    };

    const result = await completeOnboardingAction(data);
    
    if (result.success) {
      toast.success("Profile updated successfully!");
      // Force NextAuth to refresh the session token to pick up the new role and onboarding status
      await update({ role: selectedRole, onboardingCompleted: true });
      window.location.href = "/";
    } else {
      toast.error(result.error || "Failed to complete onboarding.");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[#0f172a] -skew-y-6 transform origin-top-left scale-110 -translate-y-1/2 opacity-5 pointer-events-none" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        <div className="flex justify-center mb-6">
          <Building2 className="h-12 w-12 text-[#d4a853]" />
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome to NivasaHQ
        </h2>
        <p className="mt-4 text-center text-lg text-slate-600 max-w-xl mx-auto">
          We're excited to have you! To give you the best experience, please tell us how you plan to use the platform.
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Buyer Option */}
              <div 
                onClick={() => setSelectedRole("BUYER")}
                className={`relative rounded-xl border-2 p-5 cursor-pointer transition-all duration-200 flex flex-col items-center text-center ${selectedRole === "BUYER" ? 'border-[#0f172a] bg-slate-50 shadow-md transform scale-[1.02]' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
              >
                {selectedRole === "BUYER" && <CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-[#0f172a]" />}
                <div className={`p-3 rounded-full mb-3 ${selectedRole === "BUYER" ? 'bg-[#0f172a] text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <UserCircle2 size={28} />
                </div>
                <h3 className="font-semibold text-slate-900">Buyer / Tenant</h3>
                <p className="text-xs text-slate-500 mt-2">I want to search for homes to buy or rent.</p>
              </div>

              {/* Agent Option */}
              <div 
                onClick={() => setSelectedRole("AGENT")}
                className={`relative rounded-xl border-2 p-5 cursor-pointer transition-all duration-200 flex flex-col items-center text-center ${selectedRole === "AGENT" ? 'border-[#d4a853] bg-[#d4a853]/5 shadow-md transform scale-[1.02]' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
              >
                {selectedRole === "AGENT" && <CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-[#d4a853]" />}
                <div className={`p-3 rounded-full mb-3 ${selectedRole === "AGENT" ? 'bg-[#d4a853] text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <User size={28} />
                </div>
                <h3 className="font-semibold text-slate-900">Real Estate Agent</h3>
                <p className="text-xs text-slate-500 mt-2">I want to list properties and find clients.</p>
              </div>

              {/* Builder Option */}
              <div 
                onClick={() => setSelectedRole("BUILDER")}
                className={`relative rounded-xl border-2 p-5 cursor-pointer transition-all duration-200 flex flex-col items-center text-center ${selectedRole === "BUILDER" ? 'border-sky-600 bg-sky-50 shadow-md transform scale-[1.02]' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
              >
                {selectedRole === "BUILDER" && <CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-sky-600" />}
                <div className={`p-3 rounded-full mb-3 ${selectedRole === "BUILDER" ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Home size={28} />
                </div>
                <h3 className="font-semibold text-slate-900">Builder / Developer</h3>
                <p className="text-xs text-slate-500 mt-2">I want to list new construction projects.</p>
              </div>
            </div>

            {/* Extra Fields for Agents & Builders */}
            <div className={`space-y-4 overflow-hidden transition-all duration-500 ${selectedRole === "AGENT" || selectedRole === "BUILDER" ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="pt-4 border-t border-slate-100">
                <h4 className="font-medium text-slate-900 mb-4">Professional Details</h4>
                <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company / Agency Name {selectedRole === "BUILDER" && "*"}</Label>
                    <Input id="companyName" name="companyName" placeholder="e.g., Prestige Estates" required={selectedRole === "BUILDER"} />
                  </div>
                  
                  {selectedRole === "AGENT" && (
                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber">RERA Number / License (Optional)</Label>
                      <Input id="licenseNumber" name="licenseNumber" placeholder="e.g., RERA123456" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full h-12 text-lg bg-[#0f172a] hover:bg-[#0f172a]/90 disabled:bg-slate-300 disabled:cursor-not-allowed" 
                disabled={!selectedRole || isLoading}
              >
                {isLoading ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Setting up your profile...</>
                ) : (
                  "Complete Setup"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
