require('dotenv').config({path: require('path').resolve('.env'), override: true});
const mysql = require('mysql2/promise');
mysql.createConnection({
    host: process.env.DB_HOSTNAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_SCHEMA
}).then(async c => {
    const [r] = await c.query('SHOW COLUMNS FROM delivery_proofs');
    r.forEach(x => process.stdout.write(`${x.Field} | ${x.Type} | Null=${x.Null}\n`));
    await c.end();
}).catch(e => console.error(e.message));
