# Pricora - privacy enabled, touchless, paperfree and self-administered attendance list

Pricora is an node.js based OpenSource solution for attendance lists for events and meetings of any kind.


![Tech logos](https://i.ibb.co/MgFPsnT/tech-icons.jpg)

## Proposed useage

1. Create a meeting in Pricora
2. During the event (or during your opening hours) have a tablet with the QR-Code of the meeting standing by.
a) People scan the QR-code using their own device and add themselves to the list (touchfree!)
b) Alternatively you can hand people a tablet using which they can add themselves
3. As the owner of the event you can supervise and validate the contact information that is entered at any time without personally checking paper lists.
4. The data is encrypted by using the owner's password and can technically only be deciphered by the owner of the meeting (and maybe the admin users of your Pricora instance)
5. In case health authorities request the contact list of a specific event, you (only you as the owner) can export it into a CSV file

## Screenshots 

 



| ![Scan QR code](https://i.ibb.co/bvQQmLW/scan.jpg "Scan QR code")    | ![Input contact using a mobile device](https://i.ibb.co/1mLLgXp/input.jpg "Input contact using a mobile device")         |
| ------------- | ------------- | 

## Features

- [x] Easy installation on any tiny node.js capable server
- [x] User Password-based encryption of private data
- [x] Private information is only visible to the meeting owner and not other attendants
- [x] Lists of attendans can be exported to csv files
- [x] Possibility to add personal data using your own mobile device by scanning QR code
- [x] Multiple translations available. Currently german and english.

### Planned
- [ ] Safely store data on various external cloud storage services (Dropbox, S3)
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

You need a publicly available web-server of any kind. Pricora aims for low resource usage and you will probably not have high traffic per instance. Any vServer instance should suffice (but building can take some time). 

What you need to provide:

- Linux OS
- nodejs 10 or higher
- about 500MB of disk space
- a public domain (subdomain is enough) for HTTPS
- npm and pm2 installed globally


## Installation

```console
git clone https://github.com/bjruberg/pricora
cd pricora
npm install
npm run build
npm run dev # starts client bundeling and server
```

Application will start on the address it prints to console. Note that by default it runs via HTTPS!

Now it is a good time to adjust the configuration.

## Configuration

Pricora is configured by json files. You can find and development.example.json and an production.example.json in the **confg/env** directory. 

Adjust to your needs and provide a **development.json** for dev mode and a **production.json** for production.

## Production installation

```console
# start attach to 
npm start 
# alternatively start as a service, requires pm2 installed globally
npm run start:production 
```

## Public Deployment

For simplicity reasons Pricora can be exposed to the web directly. This is why it supports https and http/2 by default. However, it is recommended to run Pricora behind a reverse proxy like nginx.

Make sure that you deploy pricora using HTTPS! Future version of pricora will be blocking unencrypted connections.

### Direct exposure
You can expose Pricora directly. You must provide valid certificates via ***server.pathToCertFile*** and ***server.pathToKeyFile***. You have to keep default seetings for ***server.https*** and ***server.http2***. You will probably want to configure ***server.bind*** and ***server.port***. When you receive the HTML from your server, configure ***hostend.frontend*** to make the frontend requestomg assets from the correct location.

### Using nginx

You should not expose pricora directly but put an instance of nginx in before. In this case you have to set both ***server.https*** and ***server.http2*** to false. This will allow nginx to connect to you pricora instance.

This is an example nginx configuration.

```
server {
        ssl on;
        ssl_certificate /etc/letsencrypt/live/<domain>/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/<domain>/privkey.pem;
        ssl_trusted_certificate /etc/letsencrypt/live/<domain>/chain.pem;


        listen 443 ssl http2;
        #listen 80;

        server_name  <domain>;
        root         /var/www/<domain>;
        index nocache.html;

        location / {
                proxy_set_header   X-Forwarded-For $remote_addr;
                proxy_set_header   Host $http_host;
                proxy_set_header   X-Forwarded-Proto https;

                proxy_pass         http://127.0.0.1:3000;
        }

        location /.well-known/acme-challenge {
                try_files $uri index.html;
        }
}

```


## Contribution

Very welcome!



## License
This project is licensed under the GPLv3 License