const configVars = {};

configVars.environment = process.env.NODE_ENV;

if (configVars.environment === 'production') {
  configVars.baseURL = process.env.GAMBIT_API_BASE_URL;
  configVars.gambitAPIKey = process.env.GAMBIT_API_KEY;
} else if (configVars.environment === 'test') {
  configVars.baseURL = 'http://localhost:9001';
  configVars.gambitAPIKey = 'totallysecret';
} else {
  configVars.baseURL = 'http://localhost:5000/v1';
  configVars.gambitAPIKey = 'totallysecret';
}

module.exports = configVars;
