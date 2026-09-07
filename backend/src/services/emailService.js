const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

let transporter = null;

const initTransporter = () => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.EMAIL_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
    return transporter;
};

const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const transporter = initTransporter();
        
        const mailOptions = {
            from: `Nexora <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: html || text,
            text: text || html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Email send error:', error);
        return { success: false, error: error.message };
    }
};

const sendAlertEmail = async (alert) => {
    const subject = `🚨 ${alert.severity.toUpperCase()} Alert: ${alert.message}`;
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; background: #0A0A1A; color: #fff; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: #1a1a2e; border-radius: 12px; padding: 30px; border: 1px solid #333; }
                .header { text-align: center; border-bottom: 1px solid #333; padding-bottom: 20px; }
                .title { font-size: 24px; font-weight: bold; }
                .severity { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
                .critical { background: #ff4444; color: #fff; }
                .high { background: #ff8800; color: #fff; }
                .warning { background: #ffcc00; color: #000; }
                .info { background: #44aaff; color: #fff; }
                .content { padding: 20px 0; }
                .field { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #222; }
                .label { color: #888; }
                .value { color: #fff; }
                .footer { text-align: center; padding-top: 20px; border-top: 1px solid #333; color: #666; font-size: 12px; }
                .button { display: inline-block; padding: 10px 20px; background: linear-gradient(135deg, #6C63FF, #00D4FF); color: #fff; text-decoration: none; border-radius: 8px; margin-top: 15px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 class="title">🚀 Nexora Alert</h1>
                    <span class="severity ${alert.severity}">${alert.severity.toUpperCase()}</span>
                </div>
                <div class="content">
                    <div class="field">
                        <span class="label">Message:</span>
                        <span class="value">${alert.message}</span>
                    </div>
                    ${alert.details?.server_name ? `
                    <div class="field">
                        <span class="label">Server:</span>
                        <span class="value">${alert.details.server_name}</span>
                    </div>
                    ` : ''}
                    ${alert.details?.server_ip ? `
                    <div class="field">
                        <span class="label">IP:</span>
                        <span class="value">${alert.details.server_ip}</span>
                    </div>
                    ` : ''}
                    <div class="field">
                        <span class="label">Time:</span>
                        <span class="value">${new Date(alert.triggered_at).toLocaleString()}</span>
                    </div>
                    ${alert.details?.description ? `
                    <div class="field">
                        <span class="label">Description:</span>
                        <span class="value">${alert.details.description}</span>
                    </div>
                    ` : ''}
                    ${alert.details?.remediation ? `
                    <div class="field">
                        <span class="label">Remediation:</span>
                        <span class="value">${alert.details.remediation}</span>
                    </div>
                    ` : ''}
                    <div style="text-align: center;">
                        <a href="${process.env.FRONTEND_URL}/alerts/${alert.id}" class="button">View in Nexora</a>
                    </div>
                </div>
                <div class="footer">
                    <p>Nexora - Next-Gen Observability Platform</p>
                    <p>This is an automated alert from your infrastructure monitoring system.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return await sendEmail({
        to: alert.details?.recipients || process.env.EMAIL_USER,
        subject,
        html
    });
};

module.exports = { sendEmail, sendAlertEmail };