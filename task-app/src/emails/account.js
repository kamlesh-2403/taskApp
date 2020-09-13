const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeMail = (email,name)=>{
    sgMail.send({
        to:email,
        from: 'kamleshrockss2017@gmail.com',
        subject:"thanks for joining",
        text:`WELCOME TO THE APP ${name}`
    })
}

const sendDeleteMail = (email,name)=>{
    sgMail.send({
        to: email,
            from:'kamleshrockss2017@gmail.com',
            subject:'account deactivation mail',
            text:"Thank you for being with us",
            html:`<h1>Thank you </br>${name}</h1>`
    })
}

module.exports = {
    sendWelcomeMail,sendDeleteMail
};