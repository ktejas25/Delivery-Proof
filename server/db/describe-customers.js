require('dotenv').config({path: require('path').resolve('.env'), override: true});
const mysql = require('mysql2/promise');
mysql.createConnection({
    host: process.env.DB_HOSTNAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_SCHEMA
}).then(async c => {
    const [r] = await c.query('DESCRIBE customers');
    r.forEach(col => {
        console.log(`${col.Field} | ${col.Type} | Null=${col.Null} | Default=${col.Default}`);
    });
    await c.end();
});
