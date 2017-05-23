# O'Doyle Scripts

## Bulk Signup
> Used to manually signup SMS only users in bulk to a campaign using the Blink chatbot proxy.

## How to use
- clone this repo
- Run `npm install`
- `node ./signup.js -f <PATH TO THE CSV TO IMPORT>`

## Notes
The code makes some assumption as of now. If its practical, it will be updated with better UX.
- It will process 250 requests at a time (uses a `for` loop)
- It waits 5 seconds before running the next batch
- The CSV is in the form:
  ```
  name_of_variable, name_of_variable
  value1, value2
  valuex, valuex
  ...
  ...
  ```
- When parsing the CSV file, it will translate each line to an `application/x-www-form-urlencoded` encoded query string, and aggregate them to an array for latter processing. Example:
  - The queries:
    - `name_of_variable=value1&name_of_variable=value2`
    - `name_of_variable=valuex&name_of_variable=valuex`
  - The Array:
    ```javascript
    [
      'name_of_variable=value1&name_of_variable=value2',
      'name_of_variable=valuex&name_of_variable=valuex',
    ]
    ```

## Nice to haves
- log errors to a file in a way that is easy to reprocess failures.
- expose settings like batchSize, batchWaitTime
- testing
- CSV data formatting
