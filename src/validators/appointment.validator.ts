import { z } from 'zod';

export const createAppointmentSchema = z.object({
  propertyId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  agentId: z.string().uuid(),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  scheduledTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM'),
  notes: z.string().max(500).optional(),
  userPhone: z.string().regex(/^[6-9]\d{9}$/).optional(),
}).refine(d => d.propertyId || d.projectId, {
  message: 'Either propertyId or projectId is required',
  path: ['propertyId'],
});

export const updateAppointmentSchema = z.object({
  status: z.enum(['CONFIRMED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  scheduledTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  notes: z.string().max(500).optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
