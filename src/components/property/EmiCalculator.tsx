"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EmiCalculator({ propertyPrice }: { propertyPrice: number }) {
  const [loanAmount, setLoanAmount] = useState(propertyPrice * 0.8);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(20);

  const calculateEmi = () => {
    const r = interestRate / 12 / 100;
    const n = tenureYears * 12;
    if (r === 0) return loanAmount / n;
    const emi = loanAmount * r * (Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1));
    return isNaN(emi) ? 0 : Math.round(emi);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-[#0f172a] mb-4">EMI Calculator</h3>
      <div className="space-y-4">
        <div>
          <Label>Loan Amount (₹)</Label>
          <Input type="number" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} />
        </div>
        <div>
          <Label>Interest Rate (%)</Label>
          <Input type="number" step="0.1" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} />
        </div>
        <div>
          <Label>Tenure (Years)</Label>
          <Input type="number" value={tenureYears} onChange={(e) => setTenureYears(Number(e.target.value))} />
        </div>
        <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
          <span className="text-gray-500 font-medium">Estimated EMI:</span>
          <span className="text-2xl font-bold text-[#d4a853]">₹{calculateEmi().toLocaleString()} /m</span>
        </div>
      </div>
    </div>
  );
}
