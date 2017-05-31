const fetch = require('node-fetch');
const logger = require('winston');
const underscore = require('underscore');
const Promise = require('bluebird');
const queryString = require('querystring');
const http =  require('http');
const mockserver = require('mockserver');

const config = require('./config');
const GambitService = require('./lib/gambit');
const BatchProcessor = require('./lib/batchProcessor');

// TODO: use config?
const testServer = http.createServer(mockserver('./mocks')).listen(9001);

function getCampaignsAndKeyword(campaigns = []) {
  const campaignsMap = {};
  campaigns.forEach(campaign => {
    campaignsMap[campaign.id] = underscore.first(campaign.keywords).keyword;
  });
  return campaignsMap;
}

function getUserIds(campaigns) {
  const usersArray = campaigns.map((campaign) => {
    const users = [];
    campaign.submissions.forEach((reportback) => {
      users.push(reportback.user);
    });
    return users;
  });

  // TODO: Should we use underscore.compact? Are we ever going to get null for an user here?
  return underscore.uniq(underscore.flatten(usersArray));
}

async function getUsers(ids = []) {
  const db = await getDB();
  let users;
  try {
    users = await db.collection('users').find({ _id: { $in: ids }}).toArray();
  } catch (error) {
    logger.error(error);
  }
  return users;
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
    // Inject keyword into the reportback submission
    mappedSubmissions = submissions.map((submission) => {
      const keyword = campaigns[submission._id];
      return submission.keyword = keyword;
    });
  } catch(error) {
    logger.error(error);
  }
  return submissions;
}

// Once we have identified these stuck submissions, re POST to chatbot route with:
// - the number of the user
// - the user's mobilecommons profile id
// - the submissions campaign keyword
//
// Also, lets post with a delay of 5 seconds per batch, just to be extremelly conservative
async function importStuckSubmissions(submissionsPerCampaign = [], users = []) {
  const batchProcessor = new BatchProcessor({
    intervalWaitInMs: 5000,
    batchSize: 2
  });
  const gambit = new GambitService({}, batchProcessor);

  gambit.on('done', async (errors, processed) => {
    logger.info(`Finished processing ${processed.length} requests!`);
    logger.info(`There were ${errors.length} errors!`);

    if (errors.length) {
      errors.forEach((error) => {
        logger.error(`This request: ${JSON.stringify(error.request)}\r\nFailed with the following error: ${error.error}`);
      })
    }
    await cleanUp();
  });

  submissionsPerCampaign.forEach((campaign) => {
    const keyword = campaign.keyword;

    campaign.submissions.forEach((reportback) => {
      const user = users.find((user) => user._id === reportback.user);

      // Do not retry users that have no:
      // mobilecommons_id
      // phoenix_id
      if (!user.phoenix_id || !user.mobilecommons_id) {
        return false;
      }

      const request = {
        method: 'post',
        endpoint: '/chatbot',
        data: queryString.stringify({
          phone: user.mobile,
          profile_id: user.mobilecommons_id,
          keyword: keyword,
        }),
      }
      gambit.enqueueRequest(request);
    });
  });
  gambit.startBatchProcess();
}

async function cleanUp() {
  const db = await getDB()
  testServer.close();
  return db.close();
}

async function getDB() {
  const db = await config.mongoDB;
  return db;
}

async function fetchCurrentCampaigns() {
  const response = await fetch(config.campaignsEndPoint).then(res => res.json())
  const campaigns = response.data;

  if (response.error) {
    throw new Error(response.error.message);
  }

  logger.info(`fetched ${JSON.stringify(campaigns.length)} running campaigns.`);
  return campaigns;
}

async function init() {
  try {
    const campaigns = await fetchCurrentCampaigns();
    const campaignsWithKeyword = getCampaignsAndKeyword(campaigns);
    const stuckSubmissions = await getStuckSubmissionsByCampaign(campaignsWithKeyword);
    const userIds = getUserIds(stuckSubmissions);
    const users = await getUsers(userIds);
    await importStuckSubmissions(stuckSubmissions, users);
  } catch (error) {
    logger.error(error);
  }
}

init();
