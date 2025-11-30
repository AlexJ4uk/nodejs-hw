import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  return transporter;
};

export const sendEmail = async ({ from, to, subject, html }) => {
  try {
    return await getTransporter().sendMail({
      from: from || process.env.SMTP_FROM,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error('Email error:', err);
    throw err;
  }
};
