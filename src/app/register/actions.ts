"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { signupSchema } from "@/lib/validations/auth";

export async function signup(_prevState: any, formData: FormData) {
  const supabase = await createClient();

  const data = {
    firstname: formData.get("firstname") as string,
    lastname: formData.get("lastname") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const result = signupSchema.safeParse(data);
  if (!result.success) {
   return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

    const { firstname, lastname, email, password } = result.data;

  // call supabase signup
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
        data: {
            first_name: firstname,
            last_name: lastname
        }
    }
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }
  revalidatePath("/", "layout");
  redirect("/");
}
