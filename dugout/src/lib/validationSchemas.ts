import { z } from "zod";

export const emailField = z
  .string()
  .min(1, "Email is required.")
  .email("Enter a valid email address.");

export const passwordField = z
  .string()
  .min(1, "Password is required.")
  .min(8, "Password must be at least 8 characters.");

const requiredString = (label: string) =>
  z.string().min(1, `${label} is required.`);

const requiredStringMin = (label: string, min: number) =>
  z
    .string()
    .min(1, `${label} is required.`)
    .min(min, `${label} must be at least ${min} characters.`);

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required."),
});

export const signupSchema = z.object({
  name: requiredString("Full name"),
  email: emailField,
  password: passwordField,
});

export const createTeamSchema = z.object({
  name: requiredStringMin("Team name", 2),
});

export const createEventSchema = z.object({
  title: requiredString("Title"),
  startsAt: requiredString("Start time"),
});

export const createSubEventSchema = z.object({
  title: requiredString("Title"),
  startsAt: requiredString("Start time"),
});

export const createAnnouncementSchema = z.object({
  title: requiredString("Title"),
  body: requiredString("Message"),
});

export const teamSettingsSchema = z.object({
  name: requiredStringMin("Team name", 2),
});

export const supplyItemSchema = z.object({
  label: requiredString("Item"),
});
