
# HR-Mailer

Sometimes we need to send the same mail to multiple recipient with a different data (like Hello John instead of Hello Ron), this is where HR mailer comes in handy.
Primarily designed to send the same emails to different HRs of different companies for a specific or different role during job hunt.

## Features

- Stores company email and name in a simplified version of mysql ([quick.db](https://www.npmjs.com/package/quick.db))
- Has an UI to input the data
- Automatically wipes data as it sends the mails
- Can send the same mail multiple times to the same user in case your emails get blocked or gets marked as spam in first or second attempt everytime (it happens in my case, I own a .me tld domain)
- Attaches your CV while mailing
- Eye catching mail design
- Easy to configure mailer


## Run Locally

Clone the project

```bash
  git clone https://github.com/folliejester/HR-Mailer.git
```

Go to the project directory

```bash
  cd HR-Mailer
```

Install dependencies

```bash
  npm install
```

Configure the configs.json file

```bash
  delete the 'config.json' file & rename 'configs.json' to 'config.json'
```

| Parameter | Explanation | Example |
| ----------------- | ----------------- | ----------------- |
| localhost_port | network port of the web server  | 80 |
| mail_host | your smtp port | smtp.gmail.com |
| mail_port | use port 465 (for SSL), or port 587 (for TLS) | 465 |
| mail_secure | if true the connection will use TLS when connecting to server. If false (the default) then TLS is used if server supports the STARTTLS extension. In most cases set this value to true if you are connecting to port 465. For port 587 or 25 keep it false | true |
| mail_auth_user | user is the username | hello@example.com |
| mail_auth_pass | pass is the password for the user if normal login is used | password |
| mail_from | The email address of the sender | hello@example.com |
| mail_username | The name to be shown it's from | John Cena |
| mail_subject | The subject of the email | Application for Java Developer |
| attachment_filename | filename to be reported as the name of the attached file. Use of unicode is allowed | CV.pdf |
| attachment_path | path to the file if you want to stream the file instead of including it (better for larger attachments) | https://example.com/CV.pdf or C:\Users\admin\Documents\CV.pdf |
| linkedin | Your linkedin profile | https://www.linkedin.com/in/example/ |
| github | Your github profile | https://github.com/example |
| googledev | Your google dev profile  | https://example.com |
| portfolio | Your portfolio link | https://portfolio.com/ |
| phone | Your mobile number | +91 98765 43210 |
| jobrole | your interested job role | Java Developer |
| max_time | maximum time in milisecond it will take to send another email | 600000 |
| min_time | minimum time in milisecond it will take to send another email | 300000 |
| loop | how many times it will send the same mail to the same recipient | 1 |
| mailerfilepath | the location where your mailer.html file is saved at | filepath/mailer.html |



Start the server

```bash
  node smtp.js
```


## API Reference

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `/`      | `GET` | Index Page |
| `/data`      | `POST` | Pushes the data to the database |
| `/delete`      | `GET` | Wipes the database entirely |
| `/showdb`      | `GET` | Displays all the data in the database |
| `/run`      | `GET` | Runs the mailer that delivers your mail |


## Demo

UI demo is available at https://hrmailer.rxo.me/


## Screenshots
Index Page

![Index Page Screenshot](https://i.imgur.com/yHcyLRK.png)

Database Viewer

![Index Page Screenshot](https://i.imgur.com/yi81tsB.png)

Database Deletion

![Index Page Screenshot](https://i.imgur.com/KdK3SCd.png)
## Minimum Requirements

This project requires you to have:

- [NodeJS v18+](https://nodejs.org/en)
## Support

For support, join our [Discord server](https://discord.gg/BDCjuxzYzw).

