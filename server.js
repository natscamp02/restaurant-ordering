require('dotenv').config({ path: './config.env' });

const app = require('./app');
const db = require('./db');
const PORT = process.env.PORT || 5000;

db.connect((err) => {
	if (err) console.error(err);
	else console.log('Connected to database...');
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));
