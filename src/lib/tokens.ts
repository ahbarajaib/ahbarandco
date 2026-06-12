import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

/**
 * Generates a password reset token for a given email, expiring in 1 hour.
 * Deletes any existing pending tokens for the same email first.
 */
export async function generatePasswordResetToken(email: string) {
  const token = randomUUID();
  const expires = new Date(Date.now() + 3600 * 1000); // 1 hour from now

  // Remove any existing password reset tokens for this email to prevent spam/abuse
  await prisma.passwordResetToken.deleteMany({
    where: { email },
  });

  // Store the new reset token in the database
  const passwordResetToken = await prisma.passwordResetToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return passwordResetToken;
}
