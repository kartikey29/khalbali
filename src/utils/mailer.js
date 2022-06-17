const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const path = require("path");
require("dotenv").config();
const ejs = require("ejs");
const juice = require("juice");
const { htmlToText } = require("html-to-text");

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

    let mailOptions;

    ejs.renderFile(
      __dirname + "/mail.ejs",
      {
        link: `${process.env.REACT_APP_FRONTEND_URL}resetpassword/${token}`,
      },
      (err, data) => {
        if (err) {
          console.log(err);
        } else {
          const html = data;
          const juiced = juice(html);
          mailOptions = {
            from: `Khalbali <${process.env.USEREMAIL}>`,
            to: email,
            subject: subject,
            html: juiced,
          };
        }
      }
    );

    transporter.sendMail(mailOptions);

    return true;
  } catch (error) {
    console.log(error, "email not sent");
    return false;
  }
};

module.exports = sendEmail;
