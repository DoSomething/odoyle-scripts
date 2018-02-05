# O'Doyle Scripts

### A collection of miscellaneous scripts of DS Messaging team

- [Bulk Signup](https://github.com/DoSomething/odoyle-scripts/tree/master/bulk-signup) Used to manually signup SMS only users in bulk to a campaign using the Blink chatbot proxy.

- [CSV to Conversations](./csv-to-conversations) Imports csv into the Gambit Conversations MongoDB.

- [Load testing](./load-tester) Load testing scripts.
  - [Broadcasts](./load-tester/load-tests/broadcasts) Load tests our broadcast infrastructure.

- [Filter Messages from a Queue](./filter-messages-from-queue) Makes a connection to a RabbitMQ instance. Consumes messages, filters them, and republish to a **failed** (failed the filter test) and a **passed** (passed the filter test) queue.
