const nodemailer = require("nodemailer");

let sendMail = (to, subject, htmlContent) =>{
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: 'testvietvp1@gmail.com', // generated ethereal user
          pass: '14102000v' // generated ethereal password
        }
      });

    let options = {
    from: 'testvietvp1@gmail.com', // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    // text: "Hello world?", // plain text body
    html: htmlContent // html body
    };

    return transporter.sendMail(options); // this default return a promise
}

module.exports = sendMail
