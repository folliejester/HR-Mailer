const nodemailer = require("nodemailer");
const bodyParser = require('body-parser');
const { QuickDB } = require("quick.db");
const config = require('./config.json');
const express = require('express');
const app = express()
const db = new QuickDB();

app.get('/', function (req, res) {
  res.sendFile(config.mailerfilepath)
})
app.listen(config.localhost_port, () => {
  console.log(`Go to: http://localhost:${config.localhost_port} \nAnd add company details.\n\n`);
});
app.use(bodyParser.json());
app.post('/data', function (req, res) {
  const { email, name } = req.body;
  pushdata(email, name);
  res.status(200).send('Data received successfully');
});
app.get('/delete', async function (req, res) {
  await db.deleteAll();
  res.send(`
    <html>
      <head>
        <style>
          body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            font-family: Arial, sans-serif;
          }
          a {
            text-decoration: none;
            color: blue;
          }
        </style>
      </head>
      <body>
        <div>
          Database Cleared! <a href="/">Go Back</a>
        </div>
      </body>
    </html>
  `);  
});
app.get('/showdb', async function (req, res) {
  const db = new QuickDB({
    file: config.sqlite_path
  });
  try {
    const data = await db.all();
    if (!Array.isArray(data) || data.length === 0) {
      return res.send(`
        <html>
          <head>
            <style>
              body {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                font-family: Arial, sans-serif;
              }
              a {
                text-decoration: none;
                color: blue;
              }
            </style>
          </head>
          <body>
            <div>
              Database is Empty! <a href="/">Go Back</a>
            </div>
          </body>
        </html>
      `);
    }
    let tableRows = '';
    let serialNumber = 1; 
    data.forEach(({ id, value }) => {
      if (value.email && value.name) {
        value.email.forEach((email, index) => {
          const name = value.name[index] || 'Unknown';
          tableRows += `<tr><td>${serialNumber}</td><td>${email}</td><td>${name}</td></tr>`;
          serialNumber++; 
        });
      }
    });
    const html = `
      <html>
        <head>
          <title>Database Contents</title>
          <style>
            table {
              width: 100%;
              border-collapse: collapse;
            }
            table, th, td {
              border: 1px solid black;
            }
            th, td {
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
            .serial-number {
              width: 10px; /* Adjust width as needed */
            }
            .name, .email {
              width: 200px; /* Adjust width as needed */
            }
          </style>
        </head>
        <body>
          <h1>Database Contents</h1>
          <table>
            <thead>
              <tr>
                <th class="serial-number">Serial No.</th>
                <th class="email">Email</th>
                <th class="name">Name</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `;
    res.send(html);
  } catch (error) {
    console.error('Error accessing database:', error.message);
    res.status(500).send('Error accessing database');
  }
});
app.get('/run', async function (req, res) {
  sender().catch(console.error);
  res.send(`Sending!`);
});
async function pushdata(email, name)
{
  if (await db.get("Company") === undefined)
  {
    await db.set("Company", []);
  }
  else
  {
    await db.push("Company.email", email);
    await db.push("Company.name", name);
  }
}
async function sender() {
  const company = await db.get("Company");
  const name = company.name[0];
  const email = company.email[0];
  if (company.name.length == 0 || company.email.length == 0) return console.log("No more companies to send to. Add some."); 
  for (let i=0; i<config.loop; i++)
  {
    const time = Math.random() * (config.max_time - config.min_time) + config.min_time;
    await main(name, email, time).catch(console.error);
    await new Promise(resolve => setTimeout(resolve, time));
  }
  await db.pull("Company.email", email);
  await db.pull("Company.name", name);
  process.nextTick(sender); 
}
const transporter = nodemailer.createTransport({
  host: config.mail_host,
  port: config.mail_port,
  secure: config.smtp_secure,
  auth: {
    user: config.mail_auth_user,
    pass: config.mail_auth_pass,
  },
});
async function main(name, email, time) {
  const info = await transporter.sendMail({
    from: `"${config.mail_username}" <${config.mail_from}>`,
    to: email,
    subject: config.mail_subject,
    html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html
  xmlns="http://www.w3.org/1999/xhtml"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office"
>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="format-detection" content="telephone=no" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css" integrity="sha512-Kc323vGBEqzTmouAECnVceyQqyqdsSiqLQISBL29aUW4U/M7pSPA/gEUZQqv1cwx4OnYxTxve5UMg5GT6L4JJg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <title>Hello!</title>
    <style type="text/css" emogrify="no">
      #outlook a {
        padding: 0;
      }
      .ExternalClass {
        width: 100%;
      }
      .ExternalClass,
      .ExternalClass p,
      .ExternalClass span,
      .ExternalClass font,
      .ExternalClass td,
      .ExternalClass div {
        line-height: 100%;
      }
      table td {
        border-collapse: collapse;
        mso-line-height-rule: exactly;
      }
      .editable.image {
        font-size: 0 !important;
        line-height: 0 !important;
      }
      .nl2go_preheader {
        display: none !important;
        mso-hide: all !important;
        mso-line-height-rule: exactly;
        visibility: hidden !important;
        line-height: 0px !important;
        font-size: 0px !important;
      }
      body {
        width: 100% !important;
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
        margin: 0;
        padding: 0;
      }
      img {
        outline: none;
        text-decoration: none;
        -ms-interpolation-mode: bicubic;
      }
      a img {
        border: none;
      }
      table {
        border-collapse: collapse;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }
      th {
        font-weight: normal;
        text-align: left;
      }
      *[class="gmail-fix"] {
        display: none !important;
      }
    </style>
    <style type="text/css" emogrify="no">
      @media (max-width: 600px) {
        .gmx-killpill {
          content: " \\03D1";
        }
      }
    </style>
    <style type="text/css" emogrify="no">
      @media (max-width: 600px) {
        .gmx-killpill {
          content: " \\03D1";
        }
        .r0-o {
          border-style: solid !important;
          margin: 0 auto 0 auto !important;
          width: 100% !important;
        }
        .r1-i {
          background-color: transparent !important;
        }
        .r2-c {
          box-sizing: border-box !important;
          text-align: center !important;
          valign: top !important;
          width: 320px !important;
        }
        .r3-o {
          border-style: solid !important;
          margin: 0 auto 0 auto !important;
          width: 320px !important;
        }
        .r4-i {
          padding-bottom: 5px !important;
          padding-top: 5px !important;
        }
        .r5-c {
          box-sizing: border-box !important;
          display: block !important;
          valign: top !important;
          width: 100% !important;
        }
        .r6-o {
          border-style: solid !important;
          width: 100% !important;
        }
        .r7-i {
          padding-left: 0px !important;
          padding-right: 0px !important;
        }
        .r8-c {
          box-sizing: border-box !important;
          padding-bottom: 13px !important;
          padding-left: 10px !important;
          padding-right: 10px !important;
          padding-top: 15px !important;
          text-align: center !important;
          width: 100% !important;
        }
        .r9-i {
          background-color: #d8e3d7 !important;
        }
        .r10-c {
          box-sizing: border-box !important;
          text-align: center !important;
          valign: top !important;
          width: 100% !important;
        }
        .r11-i {
          background-color: #ffffff !important;
          padding-left: 10px !important;
          padding-right: 10px !important;
          padding-top: 65px !important;
        }
        .r12-o {
          background-size: 100% !important;
          border-style: solid !important;
          width: 100% !important;
        }
        .r13-o {
          border-style: solid !important;
          margin: 0 auto 0 0 !important;
          width: 100% !important;
        }
        .r14-i {
          padding-bottom: 200px !important;
          text-align: left !important;
        }
        .r15-i {
          background-color: #ffffff !important;
          padding-bottom: 80px !important;
          padding-left: 10px !important;
          padding-right: 10px !important;
          padding-top: 50px !important;
        }
        .r16-c {
          box-sizing: border-box !important;
          text-align: left !important;
          valign: top !important;
          width: 100% !important;
        }
        .r17-c {
          box-sizing: border-box !important;
          padding-top: 18px !important;
          text-align: left !important;
          valign: top !important;
          width: 100% !important;
        }
        .r18-c {
          box-sizing: border-box !important;
          text-align: center !important;
          valign: top !important;
          width: 300px !important;
        }
        .r19-o {
          border-style: solid !important;
          margin: 0 auto 0 auto !important;
          margin-top: 31px !important;
          width: 300px !important;
        }
        .r20-i {
          text-align: center !important;
        }
        .r21-r {
          background-color: #4c9145 !important;
          border-radius: 30px !important;
          padding-bottom: 14px !important;
          padding-top: 14px !important;
          text-align: center !important;
          width: 300px !important;
        }
        .r22-i {
          background-color: #3f3d56 !important;
          padding-bottom: 30px !important;
          padding-left: 10px !important;
          padding-right: 10px !important;
          padding-top: 37px !important;
        }
        .r23-c {
          box-sizing: border-box !important;
          padding-left: 0px !important;
          text-align: left !important;
          valign: top !important;
          width: 100% !important;
        }
        .r24-c {
          box-sizing: border-box !important;
          padding-left: 0px !important;
          padding-top: 10px !important;
          text-align: left !important;
          valign: top !important;
          width: 100% !important;
        }
        .r25-c {
          box-sizing: border-box !important;
          text-align: left !important;
          width: 100% !important;
        }
        .r26-i {
          font-size: 0px !important;
          padding-left: 0px !important;
          padding-right: 168px !important;
          padding-top: 10px !important;
        }
        .r27-c {
          box-sizing: border-box !important;
          width: 32px !important;
        }
        .r28-o {
          border-style: solid !important;
          margin-right: 12px !important;
          width: 32px !important;
        }
        .r29-i {
          padding-top: 10px !important;
          text-align: left !important;
        }
        body {
          -webkit-text-size-adjust: none;
        }
        .nl2go-responsive-hide {
          display: none;
        }
        .nl2go-body-table {
          min-width: unset !important;
        }
        .mobshow {
          height: auto !important;
          overflow: visible !important;
          max-height: unset !important;
          visibility: visible !important;
        }
        .resp-table {
          display: inline-table !important;
        }
        .magic-resp {
          display: table-cell !important;
        }
      }
    </style>
    <!--[if !mso]><!-->
    <style type="text/css" emogrify="no">
      @import url("https://rxo.me/smtp-images/font.css");
    </style>
    <!--<![endif]-->
    <style type="text/css">
      p,
      h1,
      h2,
      h3,
      h4,
      ol,
      ul,
      li {
        margin: 0;
      }
      a,
      a:link {
        color: #3f3d56;
        text-decoration: none;
      }
      .nl2go-default-textstyle {
        color: #3f3d56;
        font-family: Open Sans, Arial, Helvetica, sans-serif;
        font-size: 18px;
        line-height: 1.5;
        word-break: break-word;
      }
      .default-button {
        color: #ffffff;
        font-family: Open Sans, Arial, Helvetica, sans-serif;
        font-size: 18px;
        font-style: normal;
        font-weight: bold;
        line-height: 1.15;
        text-decoration: none;
        word-break: break-word;
      }
      .nl2go_class_14_white_roboto_b {
        color: #ffffff;
        font-family: Open Sans, Arial, Helvetica, sans-serif;
        font-size: 14px;
        font-weight: 700;
        word-break: break-word;
      }
      .nl2go_class_14_white_roboto_l {
        color: #ffffff;
        font-family: Open Sans, Arial, Helvetica, sans-serif;
        font-size: 14px;
        font-weight: 300;
        word-break: break-word;
      }
      .default-heading1 {
        color: #67657e;
        font-family: Open Sans, Arial, Helvetica, sans-serif;
        font-size: 28px;
        word-break: break-word;
      }
      .default-heading2 {
        color: #3f3d56;
        font-family: Open Sans, Arial, Helvetica, sans-serif;
        font-size: 24px;
        word-break: break-word;
      }
      .default-heading3 {
        color: #3f3d56;
        font-family: Open Sans, Arial, Helvetica, sans-serif;
        font-size: 24px;
        word-break: break-word;
      }
      .default-heading4 {
        color: #1f2d3d;
        font-family: Open Sans, Arial, Helvetica, sans-serif;
        font-size: 18px;
        word-break: break-word;
      }
      a[x-apple-data-detectors] {
        color: inherit !important;
        text-decoration: inherit !important;
        font-size: inherit !important;
        font-family: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important;
      }
      .no-show-for-you {
        border: none;
        display: none;
        float: none;
        font-size: 0;
        height: 0;
        line-height: 0;
        max-height: 0;
        mso-hide: all;
        overflow: hidden;
        table-layout: fixed;
        visibility: hidden;
        width: 0;
        
      }
    </style>
    <!--[if mso
      ]><xml>
        <o:OfficeDocumentSettings>
          <o:AllowPNG /> <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml><!
    [endif]-->
    <style type="text/css">
      a:link {
        color: #3f3d56;
        text-decoration: none;
      }
    </style>
  </head>
  <body
    bgcolor="#D8E3D7"
    text="#3F3D56"
    link="#3F3D56"
    yahoo="fix"
    style="background-color: #d8e3d7"
  >
    <table
      cellspacing="0"
      cellpadding="0"
      border="0"
      role="presentation"
      class="nl2go-body-table"
      width="100%"
      style="background-color: #d8e3d7; width: 100%"
    >
      <tr>
        <td>
          <table
            cellspacing="0"
            cellpadding="0"
            border="0"
            role="presentation"
            width="600"
            align="center"
            class="r3-o"
            style="table-layout: fixed; width: 600px"
          >
            <tr>
              <td valign="top" class="r9-i" style="background-color: #d8e3d7">
                <table
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  role="presentation"
                  width="100%"
                  align="center"
                  class="r0-o"
                  style="table-layout: fixed; width: 100%"
                >
                  <tr>
                    <td
                      class="r11-i"
                      style="
                        background-color: #ffffff;
                        padding-left: 39px;
                        padding-right: 38px;
                        padding-top: 65px;
                      "
                    >
                      <table
                        width="100%"
                        cellspacing="0"
                        cellpadding="0"
                        border="0"
                        role="presentation"
                      >
                        <tr>
                          <th
                            width="100%"
                            valign="top"
                            class="r5-c"
                            style="font-weight: normal"
                          >
                            <table
                              cellspacing="0"
                              cellpadding="0"
                              border="0"
                              role="presentation"
                              width="100%"
                              align="left"
                              class="r13-o"
                              style="table-layout: fixed; width: 100%"
                            >
                              <tr>
                                <td
                                  align="left"
                                  valign="top"
                                  class="r14-i nl2go-default-textstyle"
                                  style="
                                    color: #3f3d56;
                                    font-family: Open Sans, Arial, Helvetica,
                                      sans-serif;
                                    font-size: 18px;
                                    line-height: 1.5;
                                    word-break: break-word;
                                    background-image: url('https://rxo.me/smtp-images/background.png');
                                    padding-bottom: 295px;
                                    text-align: left;
                                  "
                                >
                                  <div>
                                    <h1
                                      class="default-heading1"
                                      style="
                                        margin: 0;
                                        color: #67657e;
                                        font-family: Open Sans, Arial, Helvetica,
                                          sans-serif;
                                        font-size: 28px;
                                        word-break: break-word;
                                      "
                                    >
                                      Let's help each other
                                    </h1>
                                    <h1
                                      class="default-heading1"
                                      style="
                                        margin: 0;
                                        color: #67657e;
                                        font-family: Open Sans, Arial, Helvetica,
                                          sans-serif;
                                        font-size: 28px;
                                        word-break: break-word;
                                      "
                                    >
                                      <span style="color: #6bac64">GROW!</span>
                                    </h1>
                                  </div>
                                </td>
                              </tr>
                            </table>
                          </th>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                <table
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  role="presentation"
                  width="100%"
                  align="center"
                  class="r0-o"
                  style="table-layout: fixed; width: 100%"
                >
                  <tr>
                    <td
                      class="r15-i"
                      style="
                        background-color: #ffffff;
                        padding-bottom: 80px;
                        padding-left: 49px;
                        padding-right: 72px;
                        padding-top: 50px;
                      "
                    >
                      <table
                        width="100%"
                        cellspacing="0"
                        cellpadding="0"
                        border="0"
                        role="presentation"
                      >
                        <tr>
                          <th
                            width="100%"
                            valign="top"
                            class="r5-c"
                            style="font-weight: normal"
                          >
                            <table
                              cellspacing="0"
                              cellpadding="0"
                              border="0"
                              role="presentation"
                              width="100%"
                              class="r6-o"
                              style="table-layout: fixed; width: 100%"
                            >
                              <tr>
                                <td valign="top" class="r7-i">
                                  <table
                                    width="100%"
                                    cellspacing="0"
                                    cellpadding="0"
                                    border="0"
                                    role="presentation"
                                  >
                                    <tr>
                                      <td
                                        class="r16-c nl2go-default-textstyle"
                                        align="left"
                                        style="
                                          color: #3f3d56;
                                          font-family: Open Sans, Arial,
                                            Helvetica, sans-serif;
                                          font-size: 18px;
                                          line-height: 1.5;
                                          word-break: break-word;
                                          text-align: left;
                                          valign: top;
                                        "
                                      >
                                        <div>
                                          <h2
                                            class="default-heading2"
                                            style="
                                              margin: 0;
                                              color: #3f3d56;
                                              font-family: Open Sans, Arial,
                                                Helvetica, sans-serif;
                                              font-size: 24px;
                                              word-break: break-word;
                                            "
                                          >
                                            Dear Hiring Team,
                                          </h2>
                                        </div>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td
                                        class="r17-c nl2go-default-textstyle"
                                        align="left"
                                        style="
                                          color: #3f3d56;
                                          font-family: Open Sans, Arial,
                                            Helvetica, sans-serif;
                                          font-size: 18px;
                                          line-height: 1.5;
                                          word-break: break-word;
                                          padding-top: 18px;
                                          text-align: left;
                                          valign: top;
                                        "
                                      >
                                        <div>
                                          <p style="margin: 0">
                                            I am writing to express my interest in any entry-level roles in ${config.jobrole} at ${name}. 
                                            As a recent Master's graduate in Computer Application, I have a strong foundation in cloud and system administration and am eager to contribute to your team.
                                            <br><br>Please find my resume attached or <a href="${config.portfolio}" target="_blank"><U>CLICK HERE</U></a> to view it. I would welcome the opportunity to discuss how I can support your team.
                                            <br><br>Thank you for considering my application.<br><br>
                                            Best regards,<br>${config.mail_username}
                                          </p>
                                        </div>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td class="r18-c" align="left">
                                        <table
                                          cellspacing="0"
                                          cellpadding="0"
                                          border="0"
                                          role="presentation"
                                          width="402"
                                          class="r19-o"
                                          style="
                                            table-layout: fixed;
                                            width: 402px;
                                          "
                                        >
                                          <tr class="nl2go-responsive-hide">
                                            <td
                                              height="31"
                                              style="
                                                font-size: 31px;
                                                line-height: 31px;
                                              "
                                            >
                                              ­
                                            </td>
                                          </tr>
                                          <tr>
                                            <td
                                              height="23"
                                              align="center"
                                              valign="top"
                                              class="r20-i nl2go-default-textstyle"
                                              style="
                                                color: #3f3d56;
                                                font-family: Open Sans, Arial,
                                                  Helvetica, sans-serif;
                                                font-size: 18px;
                                                line-height: 1.5;
                                                word-break: break-word;
                                              "
                                            >
                                              <a
                                                href="${config.portfolio}"
                                                class="r21-r default-button"
                                                target="_blank"
                                                data-btn="1"
                                                style="
                                                  font-family: Open Sans, Arial,
                                                    Helvetica, sans-serif;
                                                  font-size: 18px;
                                                  font-style: normal;
                                                  font-weight: bold;
                                                  line-height: 1.15;
                                                  text-decoration: none;
                                                  word-break: break-word;
                                                  border-style: solid;
                                                  word-wrap: break-word;
                                                  display: block;
                                                  -webkit-text-size-adjust: none;
                                                  background-color: #4c9145;
                                                  border-bottom-width: 0px;
                                                  border-color: #4c9145;
                                                  border-left-width: 0px;
                                                  border-radius: 30px;
                                                  border-right-width: 0px;
                                                  border-top-width: 0px;
                                                  color: #ffffff;
                                                  height: 23px;
                                                  mso-hide: all;
                                                  padding-bottom: 14px;
                                                  padding-top: 14px;
                                                  width: 402px;
                                                "
                                              >View My Portfolio&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa-solid fa-arrow-up-right-from-square"></i></a>
                                              <!--<![endif]-->
                                            </td>
                                          </tr>
                                        </table>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </th>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                <table
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  role="presentation"
                  width="100%"
                  align="center"
                  class="r0-o"
                  style="table-layout: fixed; width: 100%"
                >
                  <tr>
                    <td
                      class="r22-i"
                      style="
                        background-color: #3f3d56;
                        padding-bottom: 30px;
                        padding-left: 49px;
                        padding-right: 38px;
                        padding-top: 37px;
                      "
                    >
                      <table
                        width="100%"
                        cellspacing="0"
                        cellpadding="0"
                        border="0"
                        role="presentation"
                      >
                        <tr>
                          <th
                            width="58.33%"
                            valign="top"
                            class="r5-c"
                            style="font-weight: normal"
                          >
                            <table
                              cellspacing="0"
                              cellpadding="0"
                              border="0"
                              role="presentation"
                              width="100%"
                              class="r6-o"
                              style="table-layout: fixed; width: 100%"
                            >
                              <tr>
                                <td valign="top" class="r7-i">
                                  <table
                                    width="100%"
                                    cellspacing="0"
                                    cellpadding="0"
                                    border="0"
                                    role="presentation"
                                  >
                                    <tr>
                                      <td
                                        class="r23-c nl2go-default-textstyle"
                                        align="left"
                                        style="
                                          color: #3f3d56;
                                          font-family: Open Sans, Arial,
                                            Helvetica, sans-serif;
                                          font-size: 18px;
                                          word-break: break-word;
                                          line-height: 1.6;
                                          text-align: left;
                                          valign: top;
                                        "
                                      >
                                        <div>
                                          
                                          <div
                                            class="nl2go_class_14_white_roboto_l"
                                            style="
                                              color: #fff;
                                              font-family: Open Sans, Arial,
                                                Helvetica, sans-serif;
                                              font-size: 14px;
                                              font-weight: 300;
                                              word-break: break-word;
                                            "
                                          >
                                            TM 5/104 Netaji Park
                                          </div>
                                          <div
                                            class="nl2go_class_14_white_roboto_l"
                                            style="
                                              color: #fff;
                                              font-family: Open Sans, Arial,
                                                Helvetica, sans-serif;
                                              font-size: 14px;
                                              font-weight: 300;
                                              word-break: break-word;
                                            "
                                          >
                                            Kolkata - 700157<br />
                                          </div>
                                          <div
                                            class="nl2go_class_14_white_roboto_l"
                                            style="
                                              color: #fff;
                                              font-family: Open Sans, Arial,
                                                Helvetica, sans-serif;
                                              font-size: 14px;
                                              font-weight: 300;
                                              word-break: break-word;
                                            "
                                          >
                                            West Bengal, India<br />
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td
                                        class="r24-c nl2go-default-textstyle"
                                        align="left"
                                        style="
                                          color: #3f3d56;
                                          font-family: Open Sans, Arial,
                                            Helvetica, sans-serif;
                                          font-size: 18px;
                                          line-height: 1.5;
                                          word-break: break-word;
                                          padding-top: 10px;
                                          text-align: left;
                                          valign: top;
                                        "
                                      >
                                        <div>
                                          <div
                                            class="nl2go_class_14_white_roboto_b"
                                            style="
                                              color: #fff;
                                              font-family: Open Sans, Arial,
                                                Helvetica, sans-serif;
                                              font-size: 14px;
                                              font-weight: 700;
                                              word-break: break-word;
                                            "
                                          >
                                            Find me
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td class="r25-c" align="left">
                                        <table
                                          cellspacing="0"
                                          cellpadding="0"
                                          border="0"
                                          role="presentation"
                                          width="299"
                                          align="left"
                                          class="r13-o"
                                          style="
                                            table-layout: fixed;
                                            width: 299px;
                                          "
                                        >
                                          <tr>
                                            <td valign="top">
                                              <table
                                                width="100%"
                                                cellspacing="0"
                                                cellpadding="0"
                                                border="0"
                                                role="presentation"
                                              >
                                                <tr>
                                                  <td
                                                    class="r25-c"
                                                    align="left"
                                                    style="
                                                      display: inline-block;
                                                    "
                                                  >
                                                    <table
                                                      cellspacing="0"
                                                      cellpadding="0"
                                                      border="0"
                                                      role="presentation"
                                                      width="299"
                                                      align="left"
                                                      class="r13-o"
                                                      style="
                                                        table-layout: fixed;
                                                        width: 299px;
                                                      "
                                                    >
                                                      <tr>
                                                        <td
                                                          class="r26-i"
                                                          style="
                                                            padding-right: 167px;
                                                            padding-top: 10px;
                                                          "
                                                        >
                                                          <table
                                                            width="100%"
                                                            cellspacing="0"
                                                            cellpadding="0"
                                                            border="0"
                                                            role="presentation"
                                                          >
                                                            <tr>
                                                              <th
                                                                width="44"
                                                                class="r27-c mobshow resp-table"
                                                                style="
                                                                  font-weight: normal;
                                                                "
                                                              >
                                                                <table
                                                                  cellspacing="0"
                                                                  cellpadding="0"
                                                                  border="0"
                                                                  role="presentation"
                                                                  width="100%"
                                                                  class="r28-o"
                                                                  style="
                                                                    table-layout: fixed;
                                                                    width: 100%;
                                                                  "
                                                                >
                                                                  <tr>
                                                                    <td
                                                                      class="r4-i"
                                                                      style="
                                                                        font-size: 0px;
                                                                        line-height: 0px;
                                                                        padding-bottom: 5px;
                                                                        padding-top: 5px;
                                                                      "
                                                                    ><a href="${config.linkedin}" target="_blank">
                                                                      <img
                                                                        src="https://rxo.me/smtp-images/linkedin.png"
                                                                        alt=""
                                                                        width="32"
                                                                        border="0"
                                                                        style="
                                                                          display: block;
                                                                          width: 100%;
                                                                        "
                                                                      /></a>
                                                                    </td>
                                                                    <td
                                                                      class="nl2go-responsive-hide"
                                                                      width="12"
                                                                      style="
                                                                        font-size: 0px;
                                                                        line-height: 1px;
                                                                      "
                                                                    >
                                                                      ­
                                                                    </td>
                                                                  </tr>
                                                                </table>
                                                              </th>
                                                              <th
                                                                width="44"
                                                                class="r27-c mobshow resp-table"
                                                                style="
                                                                  font-weight: normal;
                                                                "
                                                              >
                                                                <table
                                                                  cellspacing="0"
                                                                  cellpadding="0"
                                                                  border="0"
                                                                  role="presentation"
                                                                  width="100%"
                                                                  class="r28-o"
                                                                  style="
                                                                    table-layout: fixed;
                                                                    width: 100%;
                                                                  "
                                                                >
                                                                  <tr>
                                                                    <td
                                                                      class="r4-i"
                                                                      style="
                                                                        font-size: 0px;
                                                                        line-height: 0px;
                                                                        padding-bottom: 5px;
                                                                        padding-top: 5px;
                                                                      "
                                                                    >
                                                                    <a href="${config.github}" target="_blank">
                                                                    <img
                                                                        src="https://rxo.me/smtp-images/github.png"
                                                                        alt=""
                                                                        width="32"
                                                                        border="0"
                                                                        style="
                                                                          display: block;
                                                                          width: 100%;
                                                                        "
                                                                      /></a>
                                                                    </td>
                                                                    <td
                                                                      class="nl2go-responsive-hide"
                                                                      width="12"
                                                                      style="
                                                                        font-size: 0px;
                                                                        line-height: 1px;
                                                                      "
                                                                    >
                                                                      ­
                                                                    </td>
                                                                  </tr>
                                                                </table>
                                                              </th>
                                                              <th
                                                                width="44"
                                                                class="r27-c mobshow resp-table"
                                                                style="
                                                                  font-weight: normal;
                                                                "
                                                              >
                                                                <table
                                                                  cellspacing="0"
                                                                  cellpadding="0"
                                                                  border="0"
                                                                  role="presentation"
                                                                  width="100%"
                                                                  class="r28-o"
                                                                  style="
                                                                    table-layout: fixed;
                                                                    width: 100%;
                                                                  "
                                                                >
                                                                  <tr>
                                                                    <td
                                                                      class="r4-i"
                                                                      style="
                                                                        font-size: 0px;
                                                                        line-height: 0px;
                                                                        padding-bottom: 5px;
                                                                        padding-top: 5px;
                                                                      "
                                                                    >
                                                                    <a href="${config.googledev}" target="_blank">
                                                                      <img
                                                                        src="https://rxo.me/smtp-images/android.png"
                                                                        alt=""
                                                                        width="32"
                                                                        border="0"
                                                                        style="
                                                                          display: block;
                                                                          width: 100%;
                                                                        "
                                                                      /></a>
                                                                    </td>
                                                                    <td
                                                                      class="nl2go-responsive-hide"
                                                                      width="12"
                                                                      style="
                                                                        font-size: 0px;
                                                                        line-height: 1px;
                                                                      "
                                                                    >
                                                                      ­
                                                                    </td>
                                                                  </tr>
                                                                </table>
                                                              </th>
                                                            </tr>
                                                          </table>
                                                        </td>
                                                      </tr>
                                                    </table>
                                                  </td>
                                                </tr>
                                              </table>
                                            </td>
                                          </tr>
                                        </table>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </th>
                          <th
                            width="41.67%"
                            valign="top"
                            class="r5-c"
                            style="font-weight: normal"
                          >
                            <table
                              cellspacing="0"
                              cellpadding="0"
                              border="0"
                              role="presentation"
                              width="100%"
                              align="left"
                              class="r13-o"
                              style="table-layout: fixed; width: 100%"
                            >
                              <tr>
                                <td
                                  align="left"
                                  valign="top"
                                  class="r29-i nl2go-default-textstyle"
                                  style="
                                    color: #3f3d56;
                                    font-family: Open Sans, Arial, Helvetica,
                                      sans-serif;
                                    font-size: 18px;
                                    word-break: break-word;
                                    line-height: 1.3;
                                    text-align: left;
                                  "
                                >
                                  <div>
                                    <p style="margin: 0">
                                      <a
                                        href="mailto:${config.mail_from}"
                                        style="
                                          color: #3f3d56;
                                          text-decoration: none;
                                        "
                                        ><span
                                          style="
                                            color: #ffffff;
                                            font-size: 14px;
                                          "
                                          >${config.mail_from}</span
                                        ></a
                                      ><br /><a
                                        href="tel:${config.phone}"
                                        style="
                                          color: #3f3d56;
                                          text-decoration: none;
                                        "
                                        ><span
                                          style="
                                            color: #ffffff;
                                            font-size: 14px;
                                          "
                                          >${config.phone}</span
                                        ></a
                                      >
                                      <br />
                                      <a
                                        href="${config.portfolio}"
                                        style="
                                          color: #3f3d56;
                                          text-decoration: none;
                                        "
                                        ><span
                                          style="
                                            color: #ffffff;
                                            font-size: 14px;
                                          "
                                          >Portfolio</span
                                        ></a
                                      >
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            </table>
                          </th>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`,
    attachments: [{
      filename: config.attachment_filename,
      path: config.attachment_path
    }]
  });
  console.log(`Mail sent to ${name} (${email})`);
  console.log(`Waiting for ${time} ms...\n`);
}
