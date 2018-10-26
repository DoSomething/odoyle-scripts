# twilio-messages-lookup-api

It queries the Twilio's [Lookup API](https://www.twilio.com/docs/lookup/api) for carrier info for a list of Message Sids.

Reads Sids from the source `csv` file from the `/data` folder. It writes out a new destination `csv` file to the '/data' folder that contains the Message Sids plus carrier info without leaking PII.

## Usage

- Following `.env.example`. Create `.env` and update with the correct values.
- Run `npm i`
- Move the source file inside the `/data` folder.
- Run
```
puppet in ~/odscripts/twilio-messages-lookup-api $ node index.js
```
