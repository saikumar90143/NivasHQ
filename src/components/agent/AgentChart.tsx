"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', views: 140, leads: 4 },
  { name: 'Tue', views: 130, leads: 3 },
  { name: 'Wed', views: 220, leads: 8 },
  { name: 'Thu', views: 270, leads: 9 },
  { name: 'Fri', views: 180, leads: 8 },
  { name: 'Sat', views: 323, leads: 12 },
  { name: 'Sun', views: 434, leads: 15 },
];

export default function AgentChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} />
        <YAxis axisLine={false} tickLine={false} />
        <Tooltip cursor={{ fill: '#f1f5f9' }} />
        <Bar dataKey="views" fill="#0f172a" radius={[4, 4, 0, 0]} />
        <Bar dataKey="leads" fill="#d4a853" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
