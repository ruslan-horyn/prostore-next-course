"use server";

// import { isRedirectError } from 'next/dist/client/components/redirect';
import { signIn, signOut as signOutAuth } from "@/auth";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { signInFormSchema } from "../validators";

// Sign in the user with credentials
export async function signInWithCredentials(
  _prevState: unknown,
  formData: FormData
) {
  try {
    const user = signInFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    await signIn("credentials", user);

    return { success: true, message: "Signed in successfully" };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return { success: false, message: "Invalid email or password" };
  }
}

export async function signOut() {
  await signOutAuth();
}
