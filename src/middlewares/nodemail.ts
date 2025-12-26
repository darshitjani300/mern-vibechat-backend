import nodemailer, { Transporter } from "nodemailer";
import { config as configDotenv } from "dotenv";
import SMTPTransport from "nodemailer/lib/smtp-transport";
configDotenv();

interface ISendEmail {
  to: string;
  subject: string;
  html: string;
}

const transporter: Transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
} as SMTPTransport.Options);

const sendEmail = async ({ to, subject, html }: ISendEmail): Promise<void> => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};

export default sendEmail;
