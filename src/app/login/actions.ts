"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { loginSchema } from "@/lib/validations/auth";

import { createClient } from "@/utils/supabase/server";

export async function login(_prevState: any, formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };
  const result = loginSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors
    };
  }
  const { error } = await supabase.auth.signInWithPassword(data);
  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }
  revalidatePath("/", "layout");
  redirect("/");
}
