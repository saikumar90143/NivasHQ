"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPropertySchema } from '@/validators/property.validator';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUploader } from '@/components/shared/ImageUploader';
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type PropertyFormValues = z.infer<typeof createPropertySchema>;

const AMENITIES = [
  'Gym', 'Swimming Pool', 'Parking', 'Security', 'Power Backup',
  'Garden', 'Club House', 'Elevator', 'Intercom', 'Vastu Compliant'
];

interface PropertyFormProps {
  locations: { id: string; name: string; level: string }[];
}

export default function PropertyForm({ locations }: PropertyFormProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(createPropertySchema as any),
    defaultValues: {
      title: '',
      description: '',
      type: 'APARTMENT',
      listingType: 'SALE',
      price: 0,
      area: 0,
      locationId: '',
      address: '',
      images: [],
      amenities: [],
    },
    mode: 'onChange',
  });

  const step1Fields: (keyof PropertyFormValues)[] = ['title', 'description', 'type', 'listingType', 'price', 'area'];
  const step2Fields: (keyof PropertyFormValues)[] = ['bedrooms', 'bathrooms', 'furnishing', 'facing', 'possession', 'locationId', 'address', 'amenities'];
  const step3Fields: (keyof PropertyFormValues)[] = ['images'];

  const handleNext = async () => {
    const fieldsToValidate = step === 1 ? step1Fields : step2Fields;
    const isValid = await form.trigger(fieldsToValidate);
    
    if (isValid) {
      setStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    setStep((s) => s - 1);
  };

  const onSubmit = async (data: PropertyFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to create property');
      
      toast.success('Property created successfully!');
      // Typically you'd redirect here, e.g. router.push('/dashboard/properties')
    } catch (error) {
      console.error(error);
      toast.error('Failed to create property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto border-0 shadow-xl bg-white/50 backdrop-blur-sm rounded-2xl overflow-hidden">
      <div className="flex h-1.5 w-full bg-slate-100">
        <div 
          className="bg-amber-500 transition-all duration-500 ease-in-out" 
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>
      <CardHeader className="bg-slate-900 text-white p-8">
        <CardTitle className="text-3xl font-bold">
          {step === 1 && "Basic Details"}
          {step === 2 && "Features & Location"}
          {step === 3 && "Images & Review"}
        </CardTitle>
        <CardDescription className="text-slate-300 text-base mt-2">
          {step === 1 && "Provide the essential information about your property."}
          {step === 2 && "Add location details, amenities and specific features."}
          {step === 3 && "Upload high quality images and submit your listing."}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* STEP 1: Basic Details */}
            <div className={cn("space-y-6 animate-in fade-in slide-in-from-right-4", step !== 1 && "hidden")}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-2">
                      <FormLabel className="text-slate-900 font-semibold">Property Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Luxurious 3BHK Apartment in Downtown" className="h-12 border-slate-200 focus-visible:ring-amber-500 rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-900 font-semibold">Property Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 border-slate-200 focus:ring-amber-500 rounded-xl">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="APARTMENT">Apartment</SelectItem>
                          <SelectItem value="VILLA">Villa</SelectItem>
                          <SelectItem value="INDEPENDENT_HOUSE">Independent House</SelectItem>
                          <SelectItem value="PLOT">Plot</SelectItem>
                          <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                          <SelectItem value="OFFICE">Office</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="listingType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-900 font-semibold">Listing Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 border-slate-200 focus:ring-amber-500 rounded-xl">
                            <SelectValue placeholder="Select listing type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="SALE">Sale</SelectItem>
                          <SelectItem value="RENT">Rent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-900 font-semibold">Price (₹) *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Enter price" className="h-12 border-slate-200 focus-visible:ring-amber-500 rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-900 font-semibold">Area (sq.ft) *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Enter area in sqft" className="h-12 border-slate-200 focus-visible:ring-amber-500 rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-2">
                      <FormLabel className="text-slate-900 font-semibold">Description *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the property in detail..." 
                          className="min-h-[120px] resize-y border-slate-200 focus-visible:ring-amber-500 rounded-xl" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* STEP 2: Features & Location */}
            <div className={cn("space-y-8 animate-in fade-in slide-in-from-right-4", step !== 2 && "hidden")}>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="locationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-900 font-semibold">Locality / City *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 border-slate-200 focus:ring-amber-500 rounded-xl">
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locations.map(loc => (
                            <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-900 font-semibold">Full Address *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter complete address" className="h-12 border-slate-200 focus-visible:ring-amber-500 rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-900 font-semibold">Bedrooms</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Number of bedrooms" className="h-12 border-slate-200 focus-visible:ring-amber-500 rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-900 font-semibold">Bathrooms</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Number of bathrooms" className="h-12 border-slate-200 focus-visible:ring-amber-500 rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="furnishing"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-900 font-semibold">Furnishing</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 border-slate-200 focus:ring-amber-500 rounded-xl">
                            <SelectValue placeholder="Select furnishing" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="FULLY_FURNISHED">Fully Furnished</SelectItem>
                          <SelectItem value="SEMI_FURNISHED">Semi Furnished</SelectItem>
                          <SelectItem value="UNFURNISHED">Unfurnished</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="possession"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-900 font-semibold">Possession</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 border-slate-200 focus:ring-amber-500 rounded-xl">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="READY_TO_MOVE">Ready to Move</SelectItem>
                          <SelectItem value="UNDER_CONSTRUCTION">Under Construction</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormLabel className="text-slate-900 font-semibold text-lg mb-4 block">Amenities</FormLabel>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {AMENITIES.map((amenity) => (
                    <FormField
                      key={amenity}
                      control={form.control}
                      name="amenities"
                      render={({ field }) => {
                        const isChecked = field.value?.includes(amenity);
                        return (
                          <FormItem
                            key={amenity}
                            className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-slate-200 p-4 shadow-sm hover:border-amber-500 hover:bg-amber-50/30 transition-colors"
                          >
                            <FormControl>
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), amenity])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== amenity
                                        )
                                      )
                                }}
                                className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 mt-1"
                              />
                            </FormControl>
                            <FormLabel className="font-normal text-slate-700 cursor-pointer w-full h-full">
                              {amenity}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* STEP 3: Images & Review */}
            <div className={cn("space-y-6 animate-in fade-in slide-in-from-right-4", step !== 3 && "hidden")}>
              <div className="bg-amber-50/50 p-6 rounded-xl border border-amber-100 mb-6 flex items-start space-x-4">
                <CheckCircle2 className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Almost done!</h4>
                  <p className="text-slate-600 text-sm">Upload high quality photos of your property. Listings with great photos get 3x more enquiries.</p>
                </div>
              </div>

              <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-900 font-semibold text-lg block mb-4">Property Images *</FormLabel>
                    <FormControl>
                      <ImageUploader 
                        value={field.value} 
                        onChange={field.onChange} 
                        maxFiles={15} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
          </form>
        </Form>
      </CardContent>
      <CardFooter className="p-8 pt-0 flex justify-between bg-white border-t border-slate-100 mt-4">
        {step > 1 ? (
          <Button 
            type="button" 
            variant="outline" 
            onClick={handlePrev}
            className="h-12 px-6 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
        ) : (
          <div></div> // Spacer
        )}
        
        {step < 3 ? (
          <Button 
            type="button" 
            onClick={handleNext}
            className="h-12 px-8 rounded-xl bg-slate-900 text-white hover:bg-slate-800 ml-auto"
          >
            Next Step
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button 
            type="button" 
            onClick={form.handleSubmit(onSubmit)} 
            disabled={isSubmitting}
            className="h-12 px-8 rounded-xl bg-amber-500 text-white hover:bg-amber-600 ml-auto font-semibold shadow-lg shadow-amber-500/30"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Publishing...
              </>
            ) : (
              'Publish Property'
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
