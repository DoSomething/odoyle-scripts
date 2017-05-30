const fetch = require('node-fetch');
const logger = require('winston');
const underscore = require('underscore');
const Promise = require('bluebird');

const config = require('./config');
const GambitService = require('./lib/gambit');

function getCampaignsAndKeyword(campaigns) {
  const campaignsMap = {};
  campaigns.forEach(campaign => {
    campaignsMap[campaign.id] = underscore.first(campaign.keywords).keyword;
  });
  return campaignsMap;
}

async function getStuckSubmissionsByCampaign(campaigns) {
  let submissions;
  const db = await getDB();
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
    logger.error(error);
  }
  return submissions;
}

// Once we have identified these stuck submissions, re POST to chatbot route with:
// - the number of the user
// - the madeup profile id
// - the submissions campaign keyword
//
// Also, lets post with a delay of 5 seconds per request, just to be extremelly conservative
async function importStuckSubmissions(submissions = []) {
  const gambit = new GambitService();
  logger.info(submissions);
}

async function cleanUp() {
  const db = await getDB()
  return db.close();
}

async function getDB() {
  const db = await config.mongoDB;
  return db;
}

async function fetchCurrentCampaigns() {
  const result = await fetch(config.campaignsEndPoint).then(res => res.json()).then(res => res.data);
  return result;
}

async function init() {
  const campaigns = await fetchCurrentCampaigns();
  const campaignsWithKeyword = getCampaignsAndKeyword(campaigns);
  const stuckSubmissions = await getStuckSubmissionsByCampaign(campaignsWithKeyword);
  await importStuckSubmissions(stuckSubmissions);
  await cleanUp();
}

init();
