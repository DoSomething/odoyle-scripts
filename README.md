# O'Doyle Scripts

### A collection of miscellaneous scripts of DS Messaging team

- [Bulk Signup](https://github.com/DoSomething/odoyle-scripts/tree/master/bulk-signup) Used to manually signup SMS only users in bulk to a campaign using the Blink chatbot proxy.

- [CSV to Conversations](./csv-to-conversations) Imports csv into the Gambit Conversations MongoDB.

- [Load testing](./load-tester) Load testing scripts.
  - [Broadcasts](./load-tester/load-tests/broadcasts) Load tests our broadcast infrastructure.

- [Filter Messages from a Queue](./filter-messages-from-queue) Makes a connection to a RabbitMQ instance. Consumes messages, filters them, and republish to a **failed** (failed the filter test) and a **passed** (passed the filter test) queue.\

- [Update users sms_status to `active` when a failed broadcast set them to `undeliverable`](./current-sms-undeliverable-users-by-broadcast-id) Fetches the user ids of these users by inspecting the failed outbound message generated by the broadcast id. It double checks the current `sms_status` by querying Northstar. If the user is still set as `undeliverable`, it updates the `sms_status` to `active`.

- [Retrieves carrier info for Twilio Message Sids](./twilio-messages-lookup-api) It queries the Twilio's [Lookup API](https://www.twilio.com/docs/lookup/api) for carrier info for a list of Message Sids.
