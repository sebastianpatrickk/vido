import { z } from "zod";

export const allowedEmailSchema = z.object({
  email: z.string().email(),
});

export type AllowedEmail = z.infer<typeof allowedEmailSchema>;

export const allowedEmailsSchema = z
  .array(allowedEmailSchema)
  .superRefine((emails, ctx) => {
    const seen = new Set<string>();
    emails.forEach((email, index) => {
      const lowerEmail = email.email.toLowerCase();
      if (seen.has(lowerEmail)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "This email is already in the list",
          path: [index, "email"],
        });
      }
      seen.add(lowerEmail);
    });
  });

export type AllowedEmails = z.infer<typeof allowedEmailsSchema>;

export const allowedEmailsFormSchema = z.object({
  allowedEmails: allowedEmailsSchema,
});

export type AllowedEmailsForm = z.infer<typeof allowedEmailsFormSchema>;
