"use client";

import { useState } from "react";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Phone, Mail, MessageSquare } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

// Mock data
const leads = [
  { id: "1", name: "Rahul Verma", phone: "+91 9876543210", email: "rahul.v@example.com", property: "Luxury 3BHK in Bandra West", status: "NEW", date: "2 hours ago" },
  { id: "2", name: "Priya Sharma", phone: "+91 9988776655", email: "priya.s@example.com", property: "Commercial Space in BKC", status: "CONTACTED", date: "Yesterday" },
  { id: "3", name: "Amit Patel", phone: "+91 9123456789", email: "", property: "Luxury 3BHK in Bandra West", status: "QUALIFIED", date: "2 days ago" },
  { id: "4", name: "Sneha Desai", phone: "+91 9001100110", email: "sneha.d@example.com", property: "General Inquiry", status: "LOST", date: "Last week" },
];

export default function AgentLeadsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "CONTACTED": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "QUALIFIED": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "LOST": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      default: return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Leads</h2>
          <p className="text-muted-foreground">
            Manage inquiries and connect with potential buyers.
          </p>
        </div>
        <Button variant="outline">
          Export Leads
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads by name or phone..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-lg bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contact Info</TableHead>
              <TableHead>Property/Interest</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Quick Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>
                  <div className="font-medium">{lead.name}</div>
                  <div className="text-sm text-muted-foreground">{lead.phone}</div>
                  {lead.email && <div className="text-xs text-muted-foreground">{lead.email}</div>}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">{lead.property}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(lead.status)} variant="secondary">
                    {lead.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{lead.date}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50">
                      <Phone className="h-4 w-4" />
                    </Button>
                    {lead.email && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                        <Mail className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
