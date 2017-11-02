### Blink Kibana Monitoring Scripts

- Check for crashes every 5 minutes - `crashes.json`
- Check for unexpected errors every 5 minutes - `errors.json`
- Check for increased retries every 1 minute, triggered after 50 retries for the last hour - `retries.json`
- Check for increased validation errors every 30 minutes, triggered after 100 errors for the last hour - `validation-errors.json`
- Daily 10am report of validation errors seen for the past day - `validation-errors-daily.json`
