# Pricora - privacy enabled, touchless, paperless and self-administered attendance list

Pricora is an node.js based OpenSource solution for attendance lists for events and gatherings of any kind.

## Features

- [x] Easy installation on any tiny node.js capable server
- [x] User Password-based encryption of private data
- [ ] Private information is only visible to the meeting owner and not other attendants
- [x] Lists of attendans can be exported to csv files
- [x] Possibility to add personal data using your own mobile device by scanning QR code
- [ ] Safely store the private data on various cloud storage services (Dropbox, S3)
- [ ] Data of attendants is deleted automatically after a configureable period


## Why using Pricora?

Pricora's goal is to provide a simple installable and maintainable software package that can be installed on an type of small server that runs nodeJS.
It should be used by public institutions that need to keep records of attendances (e.g. for Covid tracking). Pricora is not a hosted service. The data should remain inside of the application and can only be accessed by the users running Pricora. 

Advantages over paper lists:
- Attendants have no access to contact data of other attendants
- Attendants can use their own mobile phone to add their contact data (no pen or paper touched by everyone)
- Exported data is easily readable and search able by health authorities and can be transmitted by email
- Recorded data can easily be backuped
- Data of attendants will be automatically deleted after three weeks
- No waste of paper 
- Owners can immediately check whether their guests use serious names on their own device

Advantages over other software solutions:
- No app needs to be installed by the attendants on their phones (pricora is web based)
- Data remains under your control and will not be transfered to servers of other parties (check it, it is OpenSource)
- Data can be saved on public cloud storages because it is encrypted
- Data can not be decrypted without the passwords that you keep save

## Requirements

- nodejs 10 or higher
- about 500MB of disk space
- a public domain (subdomain is enough) for HTTPS


## Installation

```console
git clone https://github.com/bjruberg/pricora
cd pricora
npm install
```

Adjust configuration

```console
npm run build
npm start
```

## Technologies used

- node.js
- typescript
- preact
- rollup
- sqlite
- koa
- graphql
- typeorm
- typegraphql
- codegen
- tailwindcss
- urql

