"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AllowedEmails,
  allowedEmailsFormSchema,
  type AllowedEmailsForm,
} from "@/lib/validations/allowed-emails";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { X, Loader } from "lucide-react";
import { Separator } from "./ui/separator";
import { env } from "@/env";
import {
  useEditAllowedEmails,
  useGetAllowedEmails,
} from "@/lib/queries/allowed-email";
import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function AllowedEmailsForm() {
  const { data: allowedEmails } = useGetAllowedEmails();
  const tasks = useQuery(api.tasks.get);

  console.log(tasks);

  const { mutateAsync: editAllowedEmails } = useEditAllowedEmails();

  const form = useForm<AllowedEmailsForm>({
    resolver: zodResolver(allowedEmailsFormSchema),
    defaultValues: {
      allowedEmails: allowedEmails,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "allowedEmails",
  });

  const onSubmit = async (data: AllowedEmailsForm) => {
    await editAllowedEmails(data.allowedEmails, {
      onSuccess: (data) => {
        form.reset({
          allowedEmails: data,
        });
      },
    });
  };

  return (
    <div className="grid bg-card border rounded-md">
      <div className="py-3 space-y-3">
        <Form {...form}>
          <div className="px-4 flex items-center gap-x-2">
            <Input type="email" value={env.NEXT_PUBLIC_OWNER_EMAIL} disabled />
            <Button
              type="button"
              variant="ghost"
              className="size-8"
              size="icon"
              disabled
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="px-4 flex items-start gap-x-2">
              <FormItem className="flex-1">
                <Input
                  key={field.id}
                  {...form.register(`allowedEmails.${index}.email`)}
                  disabled={form.formState.isSubmitting}
                  type="email"
                  placeholder="Enter email of allowed user"
                />
                <FormMessage>
                  {form.formState.errors.allowedEmails?.[index]?.email?.message}
                </FormMessage>
              </FormItem>
              <Button
                type="button"
                variant="ghost"
                className="size-8"
                size="icon"
                onClick={() => remove(index)}
                disabled={form.formState.isSubmitting}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </Form>
      </div>
      <Separator />
      <div className="px-4 py-3 flex justify-between items-center">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => append({ email: "" })}
          disabled={form.formState.isSubmitting}
        >
          Add Email
        </Button>
        <Button
          size="sm"
          className="w-32"
          onClick={(e) => form.handleSubmit(onSubmit)(e)}
          disabled={!form.formState.isDirty || form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
}
