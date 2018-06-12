# current-sms-undeliverable-users-by-broadcast-id

- It fetches the Northstar user ids (from G-Conversations) of the users whose `sms_status` where updated to `undeliverable` while receiving a broadcast.
- It requests the user's current `sms_status` from the Northstar API (using configurable rate limiting).
- It filters out the users that have since updated to other than `undeliverable`.
- It updates the users sms_status to `active`
- Saves the updated user ids in a file inside the `/data` folder.
- The saved file's format is `/data/updated-user-ids-<broadcastId>-<timestamp>.js`

### Usage

- Following `.env.example`. Create `.env` and update with the correct values.
- Run `npm i`
- Run
```
puppet in ~/odscripts/current-sms-undeliverable-users-by-broadcast-id $ node index.js -b <contentfulIdOfTheBroadcast>
```
