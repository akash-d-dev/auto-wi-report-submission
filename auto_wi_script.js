const cron = require('node-cron');
const nodemailer = require('nodemailer');
const express = require('express');
require('dotenv').config();

///////////////////////////////////////////////////////////////////
// Utility Functions - Random Data
///////////////////////////////////////////////////////////////////
function getRandomkeyTasks() {
  const keyTasks = [
    'Extension Development, API Integration.',
    'Run Test Pipeline, Write Documentation.',
    'Raise new MR, Review MR.',
    'Extension Development, Run Test Pipeline.',
    'Read Cortex Docs, Write Documentation.',
    'Fix Bugs and push the changes in new branch.',
  ];
  return keyTasks[Math.floor(Math.random() * keyTasks.length)];
}

function getRandomMeetingHighlights() {
  const meetingHighlights = [
    'MR Reviewed, Code Reviewed.',
    'New Extension Overview, Extension API Integration.',
    'Ran Test Pipeline and discussed the results.',
    'Discussed Extension Scripts.',
    'Trigger decorator overview, Job decorator Overview.',
    'Studio Extension Overview, Extension API Integration.',
  ];
  return meetingHighlights[
    Math.floor(Math.random() * meetingHighlights.length)
  ];
}

///////////////////////////////////////////////////////////////////
// Core Functions
///////////////////////////////////////////////////////////////////
function getFormValues() {
  return {
    email: 'akash.singh@kalvium.community',
    workIntegrationType: 'Work Integrated - Industry',
    companyName: 'Medable',
    keyTasks: getRandomkeyTasks(),
    meetingHighlights: getRandomMeetingHighlights(),
  };
  // return {
  //     email: "a@kalvium.community",
  //     workIntegrationType: "Work Integrated - Industry",
  //     companyName: "Morgan Stanley",
  //     keyTasks: "Review",
  //     meetingHighlights: "Review"
  // };
}

function createRequestBody(
  email,
  workIntegrationType,
  companyName,
  keyTasks,
  meetingHighlights
) {
  const today = new Date();
  const day = today.getDate().toString().padStart(2, '0');
  const monthAbbreviations = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const month = monthAbbreviations[today.getMonth()];
  const year = today.getFullYear();
  const formattedDate = `${day}-${month}-${year}`;

  return {
    Email: email,
    Date: formattedDate,
    TermsConditions: 'true',
    Dropdown: workIntegrationType,
    Dropdown1: companyName,
    MultiLine: keyTasks,
    Slider: '5',
    MultiLine1: '',
    Slider2: '5',
    MultiLine5: '',
    Radio: 'Yes',
    MultiLine6: meetingHighlights,
    REFERRER_NAME:
      'https://forms.zohopublic.in/gurmindersinghkal1/form/Signup/thankyou/formperma/GeJFMLBDfoWlIJfhI46Qyx0Dlf3kHhMSRsvMItq_Riw',
  };
}

function submitForm(requestBody) {
  fetch(
    'https://forms.zohopublic.in/gurmindersinghkal1/form/Signup/formperma/GeJFMLBDfoWlIJfhI46Qyx0Dlf3kHhMSRsvMItq_Riw/records',
    {
      headers: {
        accept: 'application/zoho.forms-v1+json',
        'content-type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      method: 'POST',
    }
  )
    .then((response) => response.json())
    .then((data) => {
      let status = data.open_thankyou_page_URL_in == 1 ? 'Success' : 'Failed';
      let emailMessage = `Status: ${status}\nKey Tasks: ${
        requestBody.MultiLine
      }\nMeeting Highlights: ${
        requestBody.MultiLine6
      }\nResponse Data: ${JSON.stringify(data)}`;
      sendEmail('Auto WI Form Submission Report', emailMessage);
    })
    .catch((error) => {
      console.error('Error:', error);
      sendEmail('FAILED - Auto WI Form Submission Report', `Error: ${error}`);
    });
}

function sendEmail(subject, message) {
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  let mailOptions = {
    from: process.env.GMAIL_USER,
    to: 'akash.singh@kalvium.community',
    subject: subject,
    text: message,
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
const hrs = 17; //24-hour format
const mins = 15;

cron.schedule(
  `${mins} ${hrs} * * 1-5`,
  () => {
    console.log(`Running scheduled task at ${hrs}:${mins}...`);
    const formValues = getFormValues();
    const requestBody = createRequestBody(
      formValues.email,
      formValues.workIntegrationType,
      formValues.companyName,
      formValues.keyTasks,
      formValues.meetingHighlights
    );
    submitForm(requestBody);
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
