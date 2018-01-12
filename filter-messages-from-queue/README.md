
# Filer messages from queue

This script is meant to filter messages inside a queue inside a RabbitMQ instance. The messages are then stored in two newly created queues by this script. We are going to call them: the **failed-filter** queue and the **passed-filter** queues. The actual names for them in the RabbitMQ instance will vary according to the **container** queue name (the name that contains the messages to be filtered).

### Important Notes

### Requirements
- Node v6.11.2
- RabbitMQ (if connecting to local instance)

### Available Filters
- niche-import-same-or-after-date
    - It assumes the messages stored in the queue are JSON objects. **Any messages that are not JSON parseable are rejected and not re-queued**
    - This filter checks for messages with the property `activity_timestamp` that has a timestamp with a date being same or after the one set in `FILTER_DATE`.

### Message schemas.
The **niche-import-same-or-after-date** filter assumes messaged being filtered follow this schema.
```
{
  "first_name": "maynard",
  "last_name": "",
  "email": "maynard@crownpawnshop.com",
  "address1": "Crown Pawn Shop, 20933 Roscoe Boulevard",
  "city": "Canoga Park",
  "state": "CA",
  "zip": "91304",
  "phone": "8189987296",
  "hs_gradyear": "1974",
  "birthdate": "1959-06-23",
  "race": "C",
  "religion": "Hedonism",
  "hs_name": "Monterey High School",
  "role": "Pawn shop owner",
  "subscribed": 1,
  "activity": "user_import",
  "activity_timestamp": 1515629861,
  "application_id": "MUI",
  "source": "Niche",
  "source_file": "1994-January-02-09-27-25.csv",
  "user_country": "US",
  "requested": "1994-01-02T10:34:00-05:00",
  "startTime": "1994-01-02T10:34:00-05:00"
}
```

### Usage
- Clone this repo to your local dev environment.
- Create your `.env` file and populate accordingly based on the included `.env.example`.
variable | notes
|---|---|
`RABBITMQ_CONNECTION_URL=`|should be set to your local RabbitMQ instance [URI](https://www.rabbitmq.com/uri-spec.html)
a)`RABBITMQ_QUEUE_NAME=`<br> b)`RABBITMQ_DURABLE_QUEUE=`| a) This is the **container** queue. The name of the queue holding the messages. <br> b) If the **container** queue is a Durable queue
`DRY_RUN=` | when set to `true`, it connects to the RabbitMQ instance and asserts the **failed-filter** and **passed-filter** queues. It DOES NOT assert or subscribe to the **container** queue. <br>When set to `false` it also asserts and subscribes to the **container** queue. Executing the filter.
`FILTER_DATE=` | date that the niche-import-same-or-after-date filter uses to filter messages.

##### Examples
- Using `RABBITMQ_QUEUE_NAME=test`
- Having 5 messages in the **container** queue


Command
- `node index.js -f niche-import-same-or-after-date`

Result
- `<passed|failed>:<count>`
	- the count reflects the amount of messages that have met that criteria. If 4 messages have passed, but only 1 has failed, you would see the following output in the terminal
		```
		passed:1
		passed:2
		passed:3
		passed:4
		failed:1
		```
- There should be 0 messages in the `test` **container** queue.
- 4 messages in the **test-passed-filter** queue
- 1 message in the **test-failed-filter** queue

### TODO
- Refactor config files in the script.
- `DRY_RUN` should not assert any queues, just connect to the instance.
- Add more examples
- Add better logging when filtering.
