import 'dotenv/config';
import nodemailer from 'nodemailer';

const smtpAktif = process.env.SMTP_HOST && process.env.SMTP_USER;

const transporter = smtpAktif
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
    : null;

export async function sendMail({ to, subject, text, html }) {
    if (!transporter) {
        console.log(`\n[EMAIL - mode pengembangan, SMTP belum diatur]\nKe     : ${to}\nSubjek : ${subject}\n${text}\n`);
        return;
    }
    await transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.SMTP_USER,
        to,
        subject,
        text,
        html,
    });
}