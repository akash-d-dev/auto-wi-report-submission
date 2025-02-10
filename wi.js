const cron = require('node-cron');


function submitForm(requestBody) {
    fetch("https://forms.zohopublic.in/gurmindersinghkal1/form/Signup/formperma/GeJFMLBDfoWlIJfhI46Qyx0Dlf3kHhMSRsvMItq_Riw/records", {
        "headers": {
            "accept": "application/zoho.forms-v1+json",
            "accept-language": "en-US,en;q=0.9",
            "content-type": "application/json",
            "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\", \"Google Chrome\";v=\"132\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest",
            "cookie": "zalb_fb90f7f307=aac3771a758cfd755b2a8a0b2e4ba31e; zfccn=3bac92d0-3ace-4b67-ac46-9954d88f6d16; _zcsr_tmp=3bac92d0-3ace-4b67-ac46-9954d88f6d16",
            "Referer": "https://forms.zohopublic.in/gurmindersinghkal1/form/Signup/formperma/GeJFMLBDfoWlIJfhI46Qyx0Dlf3kHhMSRsvMItq_Riw",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": requestBody,
        "method": "POST"
    })
        .then(response => response.json())
        .then(data => {
            data.open_thankyou_page_URL_in == 1 ? console.log("Success") : console.log("Fail")
            // console.log(data);
        })
        .catch(error => console.error('Error:', error));
}

function createRequestBody(email, workIntegrationType, companyName, keyTasks, meetingHighlights) {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const monthAbbreviations = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthAbbreviations[today.getMonth()];
    const year = today.getFullYear();

    const formattedDate = `${day}-${month}-${year}`;

    console.log(formattedDate);

    return JSON.stringify({
        "Email": email,
        "Date": formattedDate,
        "TermsConditions": "true",
        "Dropdown": workIntegrationType,
        "Dropdown1": companyName,
        "MultiLine": keyTasks,
        "Slider": "5",
        "MultiLine1": "",
        "Slider2": "5",
        "MultiLine5": "",
        "Radio": "Yes",
        "MultiLine6": meetingHighlights,
        "REFERRER_NAME": "https://forms.zohopublic.in/gurmindersinghkal1/form/Signup/thankyou/formperma/GeJFMLBDfoWlIJfhI46Qyx0Dlf3kHhMSRsvMItq_Riw"
    });
}


function getRandomkeyTasks() {
    const keyTasks = [
        "Extension Development\nAPI Integration",
        "Run Test Pipeline\nWrite Documentation",
        "Raise new MR\nReview MR",
        "Extension Development\nRun Test Pipeline",
        "Read Cortex Docs\nWrite Documentation"
    ];

    return keyTasks[Math.floor(Math.random() * keyTasks.length)];
}

function getRandomMeetingHighlights() {
    const meetingHighlights = [
        "MR Review\nCode Review",
        "New Extension Overview\nExtension API Integration",
        "Test Pipeline Run",
        "Discuss Code",
        "Trigger Overview\nJob decorator Overview"
    ];

    return meetingHighlights[Math.floor(Math.random() * meetingHighlights.length)];
}


function getFormValues() {
    return {
        email: "akash.singh@kalvium.community",
        workIntegrationType: "Work Integrated - Industry",
        companyName: "Medable",
        keyTasks: getRandomkeyTasks(),
        meetingHighlights: getRandomMeetingHighlights()
    };
}

// const requestBody = createRequestBody(getFormValues());
// console.log(requestBody);
// submitForm(requestBody);


// Schedule job to run Monday to Friday at 5 PM
cron.schedule('0 17 * * 1-5', () => {
    console.log("Running scheduled task at 5 PM...");
    const formValues = getFormValues();
    const requestBody = createRequestBody(formValues.email, formValues.workIntegrationType, formValues.companyName, formValues.keyTasks, formValues.meetingHighlights);

    submitForm(requestBody);
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
});

console.log("Scheduler is running. The task will execute every weekday at 5 PM.");