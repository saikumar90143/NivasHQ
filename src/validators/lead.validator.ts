import { z } from 'zod';

export const createLeadSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  email: z.email('Enter a valid email').optional().or(z.literal('')),
  message: z.string().max(1000).optional(),
  preferredContact: z.enum(['PHONE', 'EMAIL', 'WHATSAPP']).optional(),
  propertyId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  source: z.enum(['PROPERTY_ENQUIRY', 'WHATSAPP', 'CALL', 'SITE_VISIT_REQUEST', 'REQUIREMENT_MATCH', 'CHAT']),
  utmSource: z.string().max(100).optional(),
  utmMedium: z.string().max(100).optional(),
  utmCampaign: z.string().max(100).optional(),
  referrer: z.string().url().optional().or(z.literal('')),
  landingPage: z.string().max(2000).optional(),
  device: z.enum(['MOBILE', 'TABLET', 'DESKTOP']).optional(),
});

export const updateLeadStatusSchema = z.object({
  status: z.enum(['NEW', 'ASSIGNED', 'CONTACTED', 'SITE_VISIT_SCHEDULED', 'SITE_VISIT_DONE', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST', 'SPAM']),
  notes: z.string().max(2000).optional(),
});

/** Used by BuyerRequirementForm — captures buyer's search intent */
export const buyerRequirementSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  email: z.string().optional().or(z.literal('')),
  preferredLocations: z.array(z.string()).min(1, 'Select at least one location').optional().default([]),
  propertyType: z.string().optional(),
  budgetMin: z.coerce.number().nonnegative().optional(),
  budgetMax: z.coerce.number().nonnegative().optional(),
  bedrooms: z.coerce.number().int().min(1).max(10).optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadStatusInput = z.infer<typeof updateLeadStatusSchema>;
export type BuyerRequirementInput = z.infer<typeof buyerRequirementSchema>;

