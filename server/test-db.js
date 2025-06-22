const db = require('./db');

db.query('SELECT NOW()')
  .then((res) => {
    console.log('DB connected! Current time:', res.rows[0]);
    process.exit(0); // Force the script to exit after success
  })
  .catch((err) => {
    console.error('DB connection error:', err);
    process.exit(1);
  });

