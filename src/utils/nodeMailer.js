import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail', // or your provider
  auth: {
    user: process.env.EMAIL_USER || 'balantypro@gmail.com',
    pass: process.env.EMAIL_PASS || 'lpkvuhrztdzfgcdr',
  },
});
