//@ts-nocheck
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

const renderTemplate = (templateName: string, data: Record<string, any>) => {
  const templatePath = path.join(
    __dirname,
    "..",
    "..",
    "src",
    "email-templates",
    `${templateName}.html`
  );
  let template = fs.readFileSync(templatePath, "utf-8");

  for (const key in data) {
    const regex = new RegExp(`{{${key}}}`, "g");
    // convert values to string to avoid '[object Object]' issues
    template = template.replace(regex, String(data[key] ?? ""));
  }

  return template;
};

export const sendEmail = async (
  subject: string,
  templateName: string,
  data: Record<string, any>,
  to?: string
) => {
  try {
    data.current_year = new Date().getFullYear();
    const html = renderTemplate(templateName, data);
    const text = html.replace(/<[^>]*>/g, "");

    const mailOptions: any = {
      from: `"TrueScholar Admin" <${process.env.SMTP_USER}>`,
      subject,
      text,
      html,
    };

    if (to) {
      mailOptions.to = to;
    } else {
      const rawTo = process.env.TO_EMAIL ?? "";
      const rawCc = process.env.TO_CC ?? "";

      const toRecipients = rawTo
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean);

      const ccRecipients = rawCc
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean);

      if (toRecipients.length) mailOptions.to = toRecipients.join(",");
      if (ccRecipients.length) mailOptions.cc = ccRecipients.join(",");
    }

    const info = await getTransporter().sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
