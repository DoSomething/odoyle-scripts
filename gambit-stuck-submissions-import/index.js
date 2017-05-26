const fetch = require('node-fetch');
const config = require('./config');
const logger = require('winston');
const underscore = require('underscore');
const Promise = require('bluebird');

function getCampaignsAndKeyword(campaigns) {
  const campaignsMap = {};
  campaigns.forEach(campaign => {
    campaignsMap[campaign.id] = underscore.first(campaign.keywords).keyword;
  });
  return campaignsMap;
}

async function getStuckSubmissionsByCampaign(campaigns, db) {
  let submissions;
  const aggregator = [{
    $match: {
      $and: [
        { failed_at: { $exists: true } },
        { submitted_at: { $exists: false } },
        { campaign: { $in: Object.keys(campaigns).map(key => Number(key)) } }
      ]
    },
  },
  {
    $group: {
      _id: "$campaign",
      submissions: {
        $push: "$$ROOT"
      }
    }
  }];

  // query the production gambit database to gather all stuck submissions that belong to the current running campaigns (see above)
  try {
    submissions = await db.collection('reportback_submissions').aggregate(aggregator).toArray();
  } catch(error) {
    logger.debug(error);
  }
  return submissions;
}

// Once we have identified these stuck submissions, re POST to chatbot route with:
// - the number of the user
// - the madeup profile id
// - the submissions campaign keyword
//
// Also, lets post with a delay of 5 seconds per request, just to be extremelly conservative
function importStuckSubmissions(submissions = []) {
  logger.info(submissions);
}

function cleanUp(db) {
  db.close();
}

config.mongoDB.then((db) => {
  fetch(config.campaignsEndPoint)
    .then(res => res.json())
    .then(res => getCampaignsAndKeyword(res.data))
    .then(campaigns => getStuckSubmissionsByCampaign(campaigns, db))
    .then((stuckSubmissions) => importStuckSubmissions(stuckSubmissions))
    .then(() => cleanUp(db))
    .catch(err => logger.debug(err));
})
.catch(err => logger.debug(err));
