import { z } from "zod";

export const UserSchema = z
  .object({
    email: z.string().email(),
    username: z.string().min(2).max(100),
    password: z.string().min(6).max(100),
    cPassword: z.string().min(6).max(100),
  })
  .refine((data) => data.password === data.cPassword, {
    message: "Passwords must match",
    path: ["cPassword"],
  });



export const ProfileSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  gender: z.enum(["Male", "Female"], {
    errorMap: () => ({ message: "Gender must be Male or Female" }),
  }),
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
    invalid_type_error: "Invalid date",
  }),
  phoneNumber: z.string().min(8, "Phone number is required"),
  address: z.string().min(3, "Address is required"),
  guardianName: z.string().min(2, "Guardian's name is required"),
  guardianNumber: z.string().min(8, "Guardian's number is required"),
  previousEducation: z.string().optional(),
});

export type ProfileInput = z.infer<typeof ProfileSchema>;
  
export type AccountInput = z.infer<typeof UserSchema>;
