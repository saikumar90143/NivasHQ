import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerificationBadgeProps {
  className?: string;
  text?: string;
  size?: "sm" | "md" | "lg";
}

export default function VerificationBadge({ className, text = "Verified", size = "sm" }: VerificationBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 font-medium rounded",
        sizeClasses[size],
        className
      )}
    >
      <CheckCircle size={iconSizes[size]} className="fill-green-600 text-white" />
      {text}
    </span>
  );
}
