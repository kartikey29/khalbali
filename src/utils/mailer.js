const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const path = require("path");
require("dotenv").config();
const hbs = require("nodemailer-express-handlebars");

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

    const handlebarOptions = {
      viewEngine: {
        extName: ".handlebars",
        partialsDir: path.resolve(__dirname, "view"),
        defaultLayout: false,
      },
      viewPath: path.resolve(__dirname, "view"),
      extName: ".handlebars",
    };

    transporter.use("compile", hbs(handlebarOptions));

    let mailOptions;

    //send mail.handlerbar template in mail

    mailOptions = {
      from: `Khalbali <${process.env.USEREMAIL}>`,
      to: email,
      subject: subject,
      template: "mail",
      context: {
        link: `${process.env.REACT_APP_FRONTEND_URL}resetpassword/${token}`,
        url: process.env.REACT_APP_BACKEND_URL,
      },
    };

    transporter.sendMail(mailOptions);

    return true;
  } catch (error) {
    console.log(error, "email not sent");
    return false;
  }
};

module.exports = sendEmail;
