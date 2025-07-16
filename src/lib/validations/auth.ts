import * as z from 'zod';

export const signupSchema = z.object({
    firstname: z.string().min(1, "Firstname Required").regex(
      /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/,
      'First name can only contain letters, spaces, hyphens, or apostrophes'
    ),
    lastname: z.string().min(1, "Lastname Required").regex(
      /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/,
      'First name can only contain letters, spaces, hyphens, or apostrophes'
    ),
    email: z.string().email('Invalid Email').toLowerCase(),
    password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain a special character'),
    confirmPassword: z.string(),
})
.refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
    email: z.string().email().toLowerCase(),
    password: z.string().min(1, 'Password is required'),
})
