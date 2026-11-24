import { describe, it, expect } from 'vitest';
import { z } from 'zod';

describe('Auth Validation Schemas', () => {
  const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
  });

  const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(['BUYER', 'AGENT', 'BUILDER']),
  });

  it('validates a correct login payload', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: 'password123'
    });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid email on login', () => {
    const result = loginSchema.safeParse({
      email: 'invalid-email',
      password: 'password123'
    });
    expect(result.success).toBe(false);
  });

  it('validates a correct registration payload', () => {
    const result = registerSchema.safeParse({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'strongpassword',
      role: 'AGENT'
    });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid role on registration', () => {
    const result = registerSchema.safeParse({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'strongpassword',
      role: 'ADMIN' // ADMIN cannot be registered publicly
    });
    expect(result.success).toBe(false);
  });
});
