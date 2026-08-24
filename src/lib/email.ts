import nodemailer from "nodemailer";

// Site admin's own inbox — verification requests land here for manual
// review, same person who reviews /admin/verify.
const ADMIN_EMAIL = "eshinhw@gmail.com";

export async function sendVerificationRequestEmail(input: {
  majorName: string;
  year: number;
  bibNumber: string;
  officialName: string;
}) {
  if (!process.env.EMAIL_SERVER) {
    throw new Error("Email isn't configured — set EMAIL_SERVER.");
  }

  const transport = nodemailer.createTransport(process.env.EMAIL_SERVER);
  const subject = `Verification request: ${input.year} ${input.majorName}`;
  const text = [
    "A runner submitted a race for verification.",
    "",
    `Race: ${input.year} ${input.majorName}`,
    `Bib number: ${input.bibNumber}`,
    `Official name: ${input.officialName}`,
    "",
    "Review it at /admin/verify.",
  ].join("\n");

  await transport.sendMail({
    to: ADMIN_EMAIL,
    from: process.env.EMAIL_FROM || "Runners League <noreply@runnersleague.org>",
    subject,
    text,
  });
}
