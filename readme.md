# gmail-api
This module is designed to make Gmail api interaction easier using [google-api-nodejs-client](https://github.com/googleapis/google-api-nodejs-client).
Note that the module is under development and have no many methods at this moment.

# Intallation
```js
npm install gmail-api-node
```
# Auth
Before any interaction you need to retreive a session token, so you can do it in two ways:

####  1.  Use an existing token
```javascript
const token = {
        "access_token": "TOKEN",
        "refresh_token": "TOKEN",
        "scope": "https://www.googleapis.com/auth/gmail.modify",
        "token_type":"Bearer",
        "expiry_date":1654000000000
};

const gmail = new Gmail({
    client_secret: process.env.CLIENT_SECRET,
    client_id: process.env.CLIENT_ID,
    redirect_uris: [ "http://localhost:3000" ],
    token
});

await gmail.authorize()
```

####  2. Create a new token

```javascript
const gmail = new Gmail({
    client_secret: process.env.CLIENT_SECRET,
    client_id: process.env.CLIENT_ID,
    redirect_uris: [ "http://localhost:3000" ],
});

const authUrl = gmail.authUrl;

// go to url and return the given code

const code = getCode() // Feel free to get the code from user in any way.

await gmail.authorize(code);

// the token is created, you can store it to reuse it by using the first method
const token = gmail.token
```

# Retrieve mails
Here is an example for retrieving the first 10 mails from inbox

```javascript
    const messages = await gmail.listMessages({
        userId: "me",
        maxResults: 10,
        q: "label:inbox"
    });

    // fetch data from message (author, subject, body...)
    await Promise.all(messages.map(async message => message.fetch()));
    
    console.log(messages)
```
