import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASS,
  },
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [process.env.APP_URL!],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
        required: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      status: {
        type: "string",
        defaultValue: "ACTIVE",
        required: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      // console.log({user, url, token})
      try {
        const verificationURL = `${process.env.APP_URL}/verify-email?token=${token}`;

        const info = await transporter.sendMail({
          from: '"Prisma Blog" <prismablog@gamil.com>', // sender address
          to: user.email, // list of recipients
          subject: `Hi ${user.name}, thanks for signing up for Prisma Blog. Please verify your email address by visiting this link: ${verificationURL}`, // subject line
          html: `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email Verification</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f4f7;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f7;padding:40px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
            
            <!-- Header -->
            <tr>
              <td align="center" style="background:#4f46e5;padding:30px;">
                <h1 style="margin:0;color:#ffffff;font-size:28px;">
                  Prisma Blog
                </h1>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding:40px;">
                <h2 style="margin-top:0;color:#111827;">
                  Verify Your Email 👋
                </h2>

                <p style="font-size:16px;color:#4b5563;line-height:1.6;">
                  Thanks for signing up for <strong>Prisma Blog</strong>.
                  Please verify your email address by clicking the button below.
                </p>

                <table role="presentation" cellspacing="0" cellpadding="0" align="center" style="margin:35px auto;">
                  <tr>
                    <td align="center" bgcolor="#4f46e5" style="border-radius:8px;">
                      <a
                        href="${verificationURL}"
                        target="_blank"
                        style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:bold;"
                      >
                        Verify Email
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="font-size:15px;color:#6b7280;line-height:1.6;">
                  If the button doesn't work, copy and paste this link into your browser:
                </p>

                <p style="word-break:break-all;">
                  <a href="${verificationURL}" style="color:#4f46e5;">
                    ${verificationURL}
                  </a>
                </p>

                <hr style="border:none;border-top:1px solid #e5e7eb;margin:30px 0;" />

                <p style="font-size:14px;color:#6b7280;">
                  This verification link will expire in <strong>1 hour</strong>.
                  If you didn't create an account, you can safely ignore this email.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="padding:20px;background:#f9fafb;">
                <p style="margin:0;font-size:13px;color:#9ca3af;">
                  © ${new Date().getFullYear()} Prisma Blog. All rights reserved.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `, // HTML body
        });

        console.log("Message sent: %s", info.messageId);
      } catch (err) {
        console.error(err);
        throw err;
      }
    },
  },
  socialProviders: {
    google: {
      prompt: "select_account",
      accessType: "offline",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      
    },
  },
});
