const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const config = require('../config');

// Ensure database directory exists
const dbDir = path.dirname(config.database.path);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Read schema file
const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Create database and tables
const db = new sqlite3.Database(config.database.path);

db.serialize(() => {
    // Split schema into individual statements and execute them
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    statements.forEach((statement, index) => {
        if (statement.trim()) {
            db.run(statement, (err) => {
                if (err) {
                    console.error(`Error executing statement ${index + 1}:`, err.message);
                } else {
                    console.log(`Statement ${index + 1} executed successfully`);
                }
            });
        }
    });
    
    console.log('Database initialized successfully!');
});

db.close((err) => {
    if (err) {
        console.error('Error closing database:', err.message);
    } else {
        console.log('Database connection closed.');
    }
});
