const db = require('../config/db');

(async () => {
  try {
    const res = await db.query('SELECT NOW()');
    console.log('Current Time:', res.rows[0]);
  } catch (err) {
    console.error('Database Error:', err);
  } finally {
    db.end();
  }
})();
