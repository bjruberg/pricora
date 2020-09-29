# Pricora - privacy enabled, touchless, paperless and self-administered attendance list

Pricora is an node.js based OpenSource solution for attendance lists for events and gatherings of any kind.

## Features

- [x] Easy installation on any tiny node.js capable server
- [x] User Password-based encryption of private data
- [ ] Private information is only visible to the meeting owner and not other attendants
- [x] Lists of attendans can be exported to csv files
- [ ] Lists of attendans can be exported to xlsx files
- [ ] Possibility to add personal data using your own mobile device by scanning QR code
- [ ] Safely store the private data on various cloud storage services (Dropbox, S3)
- [ ] Data of attendants is deleted automatically after a configureable period


## Why using Pricora?

Pricora's goal is to provide a simple installable and maintainable software package that can be installed on an type of small server that runs nodeJS.
It should be used by public institutions that need to keep records of attendances (e.g. for Covid tracking). Pricora is not a hosted service. The data should remain inside of the application and can only be accessed by the users running Pricora. 

Advantages over paper lists:
- Attendants can not access to contact data from other people
- Attendants can use their own mobile phone to add their contact data (no pen touched by everyone)
- Exported data is easily readable and search able by health authorities
- Recorded data can easily be backuped
- Data of attendants will be automatically deleted after three weeks
- No waste of paper 

Advantages over other software solutions:
- No app needs to be installed by the attendant on their phone (purely web based!)
- Data remains under your control and will not be transfered to servers of other parties
- Data can be saved on public cloud storages because it is encrypted
- Data can not be restored without passwords that you keep save


## Technologies used

- node.js
- typescript
- preact
- rollup
- sqlite
- koa
- graphql
- codegen
- tailwindcss
- urql

