# current-sms-undeliverable-users-by-broadcast-id

- It fetches the Northstar user ids (from G-Conversations) of the users whose `sms_status` where updated to `undeliverable` while receiving a broadcast.
- It requests the user's current `sms_status` from the Northstar API (using configurable rate limiting).
- It filters out the users that have since updated to other than `undeliverable`.
- It stores a `.csv` of all the users that are still `undeliverable` since that broadcast.
- The saved file's format is `/data/userIds-<broadcastId>.js`

### Usage

```
puppet in ~/odscripts/current-sms-undeliverable-users-by-broadcast-id $ node index.js -b <contentfulIdOfTheBroadcast>
```
