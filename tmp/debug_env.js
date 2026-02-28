const path = require('path');
const serverDir = 'c:/Users/itste/Desktop/Tejas/Projects/DeliveryProofSample/server';
const dotenv = require(path.join(serverDir, 'node_modules/dotenv'));

dotenv.config({ path: path.join(serverDir, '.env'), override: true });

console.log('DB_HOSTNAME:', process.env.DB_HOSTNAME);
console.log('DB_USERNAME:', process.env.DB_USERNAME);
console.log('DB_SCHEMA:', process.env.DB_SCHEMA);
