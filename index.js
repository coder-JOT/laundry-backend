// server/index.js (ESM version)
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

app.post('/api/schedule-pickup', async (req, res) => {
    const { name, mobile, address, notes } = req.body;

    const message = `
    📦 Pickup Request\n
    Name: ${name}\n
    Mobile: ${mobile}\n
    Address: ${address}\n
    Notes: ${notes || 'None'}
  `;

    try {
        // Send Email
        await transporter.sendMail({
            from: `"Laundry Pickup" <${process.env.GMAIL_USER}>`,
            to: process.env.RECEIVER_EMAIL,
            subject: 'New Laundry Pickup Request',
            text: message,
        });

        // Send WhatsApp
        await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_WHATSAPP_NUMBER,
            to: process.env.OWNER_WHATSAPP_NUMBER,
        });

        res.status(200).json({ success: true });
    } catch (err) {
        console.error('Error sending notifications:', err);
        res.status(500).json({ error: 'Failed to send notifications' });
    }
});

app.listen(5000, () => console.log('Server running on port 5000'));
