"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', revenue: 420000, leads: 240 },
  { name: 'Feb', revenue: 380000, leads: 139 },
  { name: 'Mar', revenue: 200000, leads: 980 },
  { name: 'Apr', revenue: 278000, leads: 390 },
  { name: 'May', revenue: 189000, leads: 480 },
  { name: 'Jun', revenue: 420000, leads: 380 },
];

export default function AdminChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} />
        <YAxis yAxisId="left" tickFormatter={(val) => `₹${val/1000}k`} axisLine={false} tickLine={false} />
        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} />
        <Tooltip 
          formatter={(value: any, name: any) => {
            if (name === 'revenue') return [`₹${value.toLocaleString()}`, 'Revenue'];
            return [value, 'Leads'];
          }}
        />
        <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#0f172a" strokeWidth={2} activeDot={{ r: 6 }} dot={false} />
        <Line yAxisId="right" type="monotone" dataKey="leads" stroke="#d4a853" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
