const { createTransport } = require('nodemailer');

const DEFAULT_EMAIL_ADDRESS = 'no-reply@thundertube.app';

class Mail {
    constructor() {
        this.mailer = createTransport({
            host: String(process.env.EMAIL_HOST),
            port: Number(process.env.EMAIL_PORT),
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: String(process.env.EMAIL_AUTH_USER),
                pass: String(process.env.EMAIL_AUTH_PASS),
            },
        });
    }

    send(args) {
        const { to, from = DEFAULT_EMAIL_ADDRESS, subject, text } = args;
        return this.mailer.sendMail({
            to,
            from,
            subject,
            text,
        });
    }
}

module.exports = Mail;
