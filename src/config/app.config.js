const dotenv = require('dotenv');
const fs = require('node:fs');
const path = require('node:path');

const environment = ['dev', 'qa', 'local', 'uat'];
const rootEnvFile = path.join(__dirname, '../../.env');

// Load root .env first if present, so NODE_ENV can be discovered from it.
dotenv.config({ path: rootEnvFile });

const currentEnv =
  process.env.NODE_ENV && environment.includes(process.env.NODE_ENV)
    ? process.env.NODE_ENV
    : 'dev';
const envFile = path.join(__dirname, `../../.env.${currentEnv}`);

if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile, override: true });
}

module.exports = {
  ...process.env,
};
