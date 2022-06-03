const nodemailer = require("nodemailer");
const { google } = require("googleapis");
require("dotenv").config();

const sendEmail = async (email, subject, link, token) => {
  try {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.REDIRECT_URI
    );
    oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

    const accessToken = oAuth2Client.getAccessToken();
    const transporter = nodemailer.createTransport({
      service: process.env.SERVICE,
      auth: {
        type: "OAUTH2",
        user: process.env.USEREMAIL,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    await transporter.sendMail({
      from: process.env.USER,
      to: email,
      subject: subject,
      text: `${REACT_APP_FRONTEND_URL}/resetpassword/${token}`,
    });

    return true;
  } catch (error) {
    console.log(error, "email not sent");
    return false;
  }
};

module.exports = sendEmail;
