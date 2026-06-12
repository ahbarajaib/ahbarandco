"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";

import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { RegisterSchema, LoginSchema, ForgotPasswordSchema, ResetPasswordSchema } from "@/lib/validations";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/mail";

export type AuthActionState = {
  error?: string;
  success?: boolean;
  message?: string;
};

export async function registerUser(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .toLowerCase()
    .trim();
  const password = String(formData.get("password") ?? "");

  const validation = RegisterSchema.safeParse({ name, email, password });
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // If the account was created via Google, it won't have a passwordHash.
    // Allow the user to "link" it by setting a password and upgrading their login type!
    if (!existing.passwordHash) {
      const passwordHash = await bcrypt.hash(password, 12);
      await prisma.user.update({
        where: { email },
        data: { passwordHash },
      });
      try {
        await signIn("credentials", { email, password, redirectTo: "/" });
      } catch (error) {
        if (isRedirectError(error)) throw error;
        return { error: "Account linked but sign-in failed. Please try logging in." };
      }
      return { success: true, message: "Your Google account has been linked with password access!" };
    }
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: { name, email, passwordHash },
  });

  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (error) {
    // NextAuth throws a NEXT_REDIRECT for successful redirects — re-throw it
    if (isRedirectError(error)) throw error;
    if (error instanceof AuthError) {
      return { error: "Account created but sign-in failed. Please log in." };
    }
    throw error;
  }

  return { success: true, message: "Welcome to Ahbar & Co." };
}

export async function loginUser(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "")
    .toLowerCase()
    .trim();
  const password = String(formData.get("password") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "/");

  const validation = LoginSchema.safeParse({ email, password });
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (user && !user.passwordHash) {
    return { error: "This account is linked with Google. Please use 'Sign in with Google'." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    // NextAuth throws a NEXT_REDIRECT for successful redirects — re-throw it
    if (isRedirectError(error)) throw error;
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error;
  }

  return { success: true, message: "Signed in successfully." };
}

export async function requestPasswordReset(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  console.log(`[PASSWORD RESET] Request received for email: "${email}"`);

  const validation = ForgotPasswordSchema.safeParse({ email });
  if (!validation.success) {
    console.log(`[PASSWORD RESET] Validation failed:`, validation.error.issues[0].message);
    return { error: validation.error.issues[0].message };
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      console.log(`[PASSWORD RESET] User "${email}" not found in database. Pretending success for security.`);
      return { 
        success: true, 
        message: "If this email exists in our records, we have sent a password reset link to it." 
      };
    }

    // If the user is Google-only, they should not reset password via credentials
    if (!user.passwordHash) {
      console.log(`[PASSWORD RESET] User "${email}" is registered via Google OAuth (no password hash). Bypassing email send.`);
      return { 
        success: true, 
        message: "If this email exists in our records, we have sent a password reset link to it." 
      };
    }

    console.log(`[PASSWORD RESET] User "${email}" found with password hash. Generating token...`);
    const resetToken = await generatePasswordResetToken(email);
    
    console.log(`[PASSWORD RESET] Token generated: ${resetToken.token}. Sending email via Resend SMTP...`);
    await sendPasswordResetEmail(email, resetToken.token);
    
    console.log(`[PASSWORD RESET] Email sent successfully to "${email}".`);

    return { 
      success: true, 
      message: "If this email exists in our records, we have sent a password reset link to it." 
    };
  } catch (error) {
    console.error("[PASSWORD RESET] Request error:", error);
    return { error: "Something went wrong. Please try again later." };
  }
}

export async function executePasswordReset(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!token) {
    return { error: "Missing password reset token." };
  }

  const validation = ResetPasswordSchema.safeParse({ password });
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  try {
    const tokenRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!tokenRecord || tokenRecord.expires < new Date()) {
      return { error: "This link is invalid or has expired. Please request a new one." };
    }

    const user = await prisma.user.findUnique({
      where: { email: tokenRecord.email },
    });

    if (!user) {
      return { error: "Email address not found." };
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Update user password and delete reset token in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { email: tokenRecord.email },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.delete({
        where: { token },
      }),
    ]);

    return { success: true, message: "Your password has been reset successfully! You can now log in." };
  } catch (error) {
    console.error("Password reset execution error:", error);
    return { error: "Failed to reset password. Please try again." };
  }
}

