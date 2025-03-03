const cron = require('node-cron');
const nodemailer = require('nodemailer');
const express = require('express');
const fs = require('fs');
require('dotenv').config();

///////////////////////////////////////////////////////////////////
// Utility Functions - Random Data from JSON
///////////////////////////////////////////////////////////////////
function getRandomFromArray(arr) {
    if (!arr || arr.length === 0) return '';
    return arr[Math.floor(Math.random() * arr.length)];
}

///////////////////////////////////////////////////////////////////
// Core Functions
///////////////////////////////////////////////////////////////////
function getFormValues(person) {
    return {
        email: person.email,
        workIntegrationType: person.type === 'wi' ? 'Work Integrated - Industry' : 'Work Integrated - Simulated',
        companyName: person.company || '',
        keyTasks: getRandomFromArray(person.keyTasks),
        meetingHighlights: person.type === 'wi' ? getRandomFromArray(person.meetingHighlights) : ''
    };
}

function createRequestBody(person, formValues) {

    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const monthAbbreviations = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const month = monthAbbreviations[today.getMonth()];
    const year = today.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;

    const requestBody = {
        Email: formValues.email,
        Date: formattedDate,
        TermsConditions: 'true',
        Dropdown: formValues.workIntegrationType,
        Dropdown1: formValues.companyName || undefined,
        MultiLine: formValues.keyTasks,
        Slider: '5',
        MultiLine1: '',
        Slider2: '5',
        MultiLine5: '',
        Radio: person.type === 'wi' ? 'Yes' : undefined,
        MultiLine6: formValues.meetingHighlights || undefined,
        REFERRER_NAME: 'https://forms.zohopublic.in/gurmindersinghkal1/form/Signup/thankyou/formperma/GeJFMLBDfoWlIJfhI46Qyx0Dlf3kHhMSRsvMItq_Riw'
    };

    Object.keys(requestBody).forEach(key => {
        if (requestBody[key] === undefined) {
            delete requestBody[key];
        }
    });

    return requestBody;
}

function submitForm(requestBody) {
    fetch(
        'https://forms.zohopublic.in/gurmindersinghkal1/form/Signup/formperma/GeJFMLBDfoWlIJfhI46Qyx0Dlf3kHhMSRsvMItq_Riw/records',
        {
            headers: {
                accept: 'application/zoho.forms-v1+json',
                'content-type': 'application/json'
            },
            body: JSON.stringify(requestBody),
            method: 'POST'
        }
    )
        .then((response) => response.json())
        .then((data) => {
            let status = data.open_thankyou_page_URL_in == 1 ? 'Success' : 'Failed';
            let emailMessage = `Status: ${status}\nKey Tasks: ${requestBody.MultiLine || 'N/A'}`;
            if (requestBody.MultiLine6) {
                emailMessage += `\nMeeting Highlights: ${requestBody.MultiLine6}`;
            }
            emailMessage += `\nResponse Data: ${JSON.stringify(data)}`;
            sendEmail('Auto Form Submission Report', emailMessage, requestBody.Email);
        })
        .catch((error) => {
            console.error('Error:', error);
            sendEmail('FAILED - Auto Form Submission Report', `Error: ${error}`, requestBody.Email);
        });
}

function sendEmail(subject, message, to) {

    console.log("***********************")
    console.log('Sending email to:', to);
    console.log('Subject:', subject);
    console.log('Message:', message);
    console.log("***********************")

    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    let mailOptions = {
        from: process.env.GMAIL_USER,
        to: to,
        subject: subject,
        text: message
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent successfully:', info.response);
        }
    });
}

///////////////////////////////////////////////////////////////////
// Scheduler
///////////////////////////////////////////////////////////////////
const hrs = 18; // 24-hour format
const mins = 52;

cron.schedule(
    `${mins} ${hrs} * * 1-5`,
    () => {
        console.log(`Running scheduled task at ${hrs}:${mins}...`);
        let folksData = [];
        try {
          const data = fs.readFileSync('./folks.json', 'utf8')
          folksData = JSON.parse(data)
        } catch (err) {
          console.error('Error reading folks.json:', err)
        }
        if (!folksData) {
            console.error('No data found!');
            return
        };
        console.log(folksData);
        (async () => {
            for (const person of folksData) {
            const formValues = getFormValues(person);
            const requestBody = createRequestBody(person, formValues);
            submitForm(requestBody);
            await new Promise(resolve => setTimeout(resolve, 5000)); // 5 seconds delay
            }
        })();
    },
    { scheduled: true, timezone: 'Asia/Kolkata' }
);
console.log(
    `Scheduler is running. The task will execute every weekday at ${hrs}:${mins}.`
);

///////////////////////////////////////////////////////////////////
// Server Setup
///////////////////////////////////////////////////////////////////
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Server is running!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});