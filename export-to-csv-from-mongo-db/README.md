# export-to-csv-from-mongo-db

- It fetches documents from the Gambit-Conversations DB.
- Saves the documents in a file inside the `/data` folder.

# Scripts
- `sids-by-broadcast-and-error-code` - Retrieves Message Sids of `outbound-api-send` messages during a broadcast and reported by Twilio as not being delivered.
- `sids-by-broadcast-and-queued` - Retrieves Message Sids of `outbound-api-send` messages during a broadcast and not reported by Twilio as delivered or failed.

### Usage

- Following `.env.example`. Create `.env` and update with the correct values.
- Run `npm i`
- Run
```
// Example
puppet in ~/odscripts/export-to-csv-from-mongo-db $ node index.js -s sids-by-broadcast-and-error-code
```
