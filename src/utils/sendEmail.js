require('dotenv').config();
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const ses = new SESClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

async function sendEmail({ to, subject, html = "", text = "" }) {
    if (!html && !text) {
        throw new Error("Either 'html' or 'text' content must be provided.");
    }

    const body = {};
    if (html) {
        body.Html = {
            Charset: "UTF-8",
            Data: html,
        };
    }
    if (text) {
        body.Text = {
            Charset: "UTF-8",
            Data: text,
        };
    }

    const params = {
        Destination: {
            ToAddresses: [to],
        },
        Message: {
            Body: body,
            Subject: {
                Charset: "UTF-8",
                Data: subject,
            },
        },
        Source: "uday@dev-tinder.info", // Make sure this is SES-verified
    };
    console.log("--------------------------")
    try {
        const result = await ses.send(new SendEmailCommand(params));
        console.log("Email sent! Message ID:", result.MessageId);
        return result;
    } catch (err) {
        console.error("Failed to send email via SES:", err);
        throw err; // Propagate error to the route
    }
}

module.exports = { sendEmail };
