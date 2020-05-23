const catchAsync = require('../utils/catchAsync');
const mail = require('@sendgrid/mail');
mail.setApiKey(process.env.EMAIL_KEY);

exports.sendEmail = catchAsync(async (req, res, next) => {
  const { email, name, message } = req.body;

  const emailData = {
    to: process.env.EMAIL_FROM,
    from: process.env.EMAIL_FROM,
    subject: `Contact from - ${process.env.APP_NAME}`,
    text: `Email received from contact from \n Sender name: ${name} 
                                            \n Sender email: ${email} 
                                            \n Sender message: ${message}`,
    html: `<h4>Email received from contact form:</h4>
         <p> Sender name: ${name}</p>
         <p> Sender email: ${email}</p>
         <p> Sender message: ${message}</p>
         <hr />
         <p> https://bloggy.com</P>
         `
  };
  const result = await mail.send(emailData);
  return res.json({
    status: 'success',
    result
  });
});

exports.sendEmailToAuthor = catchAsync(async (req, res, next) => {
  const { authorEmail, email, name, message } = req.body;

  const emailData = {
    to: authorEmail,
    from: process.env.EMAIL_FROM,
    subject: `Someone messages you from - ${process.env.APP_NAME}`,
    text: `Email received from contact from \n Sender name: ${name} 
                                            \n Sender email: ${email} 
                                            \n Sender message: ${message}`,
    html: `<h4>Message received from contact form:</h4>
         <p> Name: ${name}</p>
         <p> Email: ${email}</p>
         <p> Message: ${message}</p>
         <hr />
         <p> https://bloggy.com</P>
         `
  };

  const result = await mail.send(emailData);
  return res.json({
    status: 'success',
    result
  });
});
