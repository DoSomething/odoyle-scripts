const configVars = {};

if (process.env.NODE_ENV === 'production') {
  configVars.baseURL = process.env.GAMBIT_API_BASE_URL;
  configVars.gambitAPIKey = process.env.GAMBIT_API_KEY;
}else {
  configVars.baseURL = 'http://localhost:5000/v1';
  configVars.gambitAPIKey = 'totallysecret';
}

module.exports = configVars;
