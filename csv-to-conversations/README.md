# csv to conversations

A Node script to upsert Conversations in the Gambit Conversations DB with a given csv.

## Usage
```
node index --file=../../TGM/test.csv --campaign=7554
```
Required parameters:
* `file` - path to the csv to import
* `campaign` - numeric Campaign ID to set as the `Conversation.campaignId`

Optional parameters:
* `topic` - set the Conversation topic, defaults to `'random'`
* `importSource` - sets a  `importSource` property in case of any gotchas

## Format
Expected file format is a first row of column names, with the first column defined as `'phone_number'`. The first column is the only data that is used.
```
phone_number, first_name
value1, value2
valuex, valuex
...
```
