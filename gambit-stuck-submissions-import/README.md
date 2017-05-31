# Gambit stuck submissions import
This script will attempt to resubmit all "stuck" submissions that belong to the currently active campaigns.

# How to use
#### Development
Run `LOGGING_LEVEL=debug npm start`
- NOTE: Will by default re post reportbacks to gambit localhost. Will use the gambit localhost as base url and generic gambit API key.

#### Production 🚨
Run `LOGGING_LEVEL=debug NODE_ENV=production npm start`
- ⚠️: Will re post reportbacks using the base url and gambit API key stored in your `.env` file. Potentially impacting real, production users.

# Some things to consider
- This script will **only** re-post reportbacks **directly** to Gambit that:
  - belong to currently running campaigns.
  - **Do not** have a `submitted_at` property.
  - **Have** a `failed_at` property.
  - It's user **has** a `mobilecommons_id` property.
  - It's user **has** a `phoenix_id` property.
- If the reportback does not meet the above, it will not be re-posted.

# FAQ
- What do you mean by stuck?
> Some reportbacks might have failed due to bugs. These submissions remain in a state of failure in the Gambit database until the bug is fixed. Once fixed, we can run this script to resubmit these reportbacks.
