import { z } from "zod";

export const UserSchema = z
  .object({
    email: z.string().email(),
    username: z.string().min(2).max(100).regex(/^[a-zA-Z0-9_]+$/, "Username must be alphanumeric and can only contain underscores"),
    password: z.string().min(8).max(100).regex(/^(?=.*[A-Za-z])(?=.*\d).{6,}$/, "Password must be at least 6 characters long and contain at least one letter and one number"),
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

export const teacherApplicationSchema = z.object({
  vacancyId: z.string(),
  highestDegree: z.string().min(2),
  certifications: z.array(z.string()).optional(),
  experienceYears: z.coerce.number().min(0),
  achievements: z.string().optional(),
  languages: z.array(z.string()).min(1),
  techSkills: z.array(z.string()).optional(),
  resumeUrl: z.string().url().optional(),
  certificatesUrl: z.string().url().optional(),
  motivation: z.string().min(10),
  equipment: z.string().optional(),
})

export const teacherProfileSchema = z.object({
  userId: z.string().uuid().optional(),
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  phoneNumber: z.string().min(7, "Phone number must be valid").max(15),
  address: z.string().optional(),
  highestDegree: z.string().optional(),
  certifications: z
    .string()
    .transform((val) =>
      val ? val.split(",").map((s) => s.trim()) : []
    )
    .optional(),
  experienceYears: z.preprocess(
    (val) => (val !== "" ? Number(val) : undefined),
    z.number().int().min(0).optional()
  ),
  languages: z
    .string()
    .transform((val) =>
      val ? val.split(",").map((s) => s.trim()) : []
    )
    .optional(),
  techSkills: z
    .string()
    .transform((val) =>
      val ? val.split(",").map((s) => s.trim()) : []
    )
    .optional(),
  bio: z.string().max(500).optional(),
  equipment: z.string().optional(),
});

export const levelSchema = z.object({
  name: z.string().min(1, { message: 'Level name is required.' }),
  description: z.string().optional(),
});

export const trackSchema = z.object({
  name: z.string().min(1, { message: 'Track name is required.' }),
  description: z.string().optional(),
});

export const programSchema = z.object({
  name: z.string().min(1, { message: 'Program name is required.' }),
  description: z.string().optional(),
  levelId: z.string().min(1, { message: 'Level is required.' }),
  trackId: z.string().min(1, { message: 'Track is required.' }),
});

export type LevelFormValues = z.infer<typeof levelSchema>;

export type TrackFormValues = z.infer<typeof trackSchema>;

export type ProgramFormValues = z.infer<typeof programSchema>;

export type TeacherProfileInput = z.infer<typeof teacherProfileSchema>;

export type TeacherApplicationValues = z.infer<typeof teacherApplicationSchema>

export type ProfileInput = z.infer<typeof ProfileSchema>;
  
export type AccountInput = z.infer<typeof UserSchema>;
