import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'paltmilen@gmail.com',
    pass: process.env.SMTP_PASSWORD,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'paltmilen@gmail.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  } catch (error) {
    console.error('Fel vid skickning av e-post:', error);
    throw new Error('Kunde inte skicka e-post');
  }
};

export const sendRegistrationConfirmation = async (
  email: string,
  firstName: string,
  lastName: string,
  registrationNumber: string,
  eventName: string
): Promise<void> => {
  const html = `
    <h2>Bekräftelse av anmälan</h2>
    <p>Hej ${firstName} ${lastName},</p>
    <p>Tack för din anmälan till ${eventName}!</p>
    <p><strong>Anmälningsnummer:</strong> ${registrationNumber}</p>
    <p>Du kommer att få mer information om eventet närmare startdatum.</p>
    <p>Med vänliga hälsningar,<br/>Jp7an-timing</p>
  `;

  await sendEmail({
    to: email,
    subject: `Bekräftelse av anmälan - ${eventName}`,
    html,
  });
};
