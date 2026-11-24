"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { buyerRequirementSchema } from "@/validators/lead.validator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

type BuyerRequirementFormValues = z.infer<typeof buyerRequirementSchema>;

export function BuyerRequirementForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<BuyerRequirementFormValues>({
    resolver: zodResolver(buyerRequirementSchema as any),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      preferredLocations: [],
      propertyType: "",
      budgetMin: undefined,
      budgetMax: undefined,
      bedrooms: undefined,
    },
  });

  async function onSubmit(data: BuyerRequirementFormValues) {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Buyer requirement posted:", data);
      setIsSubmitted(true);
      toast.success("Your requirement has been posted successfully!");
    } catch (error) {
      toast.error("Failed to post requirement. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center bg-muted/50 rounded-xl border">
        <CheckCircle2 className="h-12 w-12 text-green-500" />
        <h3 className="text-xl font-semibold">Requirement Received!</h3>
        <p className="text-muted-foreground max-w-sm">
          Thank you for sharing your property requirement. Our top agents in your preferred locations will contact you with matching properties soon.
        </p>
        <Button onClick={() => {
          setIsSubmitted(false);
          form.reset();
        }} variant="outline" className="mt-4">
          Post Another Requirement
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium leading-none">Personal Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="9876543210" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Email Address (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium leading-none">Property Requirements</h3>
          
          {/* Note: Multi-select is simplified to comma separated string for locations in this demo */}
          <FormField
            control={form.control}
            name="preferredLocations"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Preferred Locations</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g. Bandra, Andheri" 
                    onChange={(e) => {
                      const vals = e.target.value.split(",").map(v => v.trim()).filter(Boolean);
                      field.onChange(vals);
                    }}
                    value={field.value?.join(", ") || ""}
                  />
                </FormControl>
                <FormDescription>Comma separated list of areas</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="propertyType"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Property Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="APARTMENT">Apartment</SelectItem>
                      <SelectItem value="VILLA">Villa / Independent House</SelectItem>
                      <SelectItem value="PLOT">Plot / Land</SelectItem>
                      <SelectItem value="COMMERCIAL">Commercial Office</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bedrooms"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Bedrooms</FormLabel>
                  <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select BHK" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">1 BHK</SelectItem>
                      <SelectItem value="2">2 BHK</SelectItem>
                      <SelectItem value="3">3 BHK</SelectItem>
                      <SelectItem value="4">4+ BHK</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="budgetMin"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Min Budget (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="5000000" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="budgetMax"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Max Budget (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="15000000" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit" className="w-full md:w-auto" size="lg" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Post Requirement
        </Button>
      </form>
    </Form>
  );
}
