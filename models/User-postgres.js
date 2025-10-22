const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const config = require('../config-vercel');

class User {
    constructor() {
        this.pool = new Pool(config.database);
    }

    // Create a new user
    async create(username, email, password) {
        const hashedPassword = bcrypt.hashSync(password, 10);
        const client = await this.pool.connect();
        
        try {
            const result = await client.query(
                'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
                [username, email, hashedPassword]
            );
            
            return result.rows[0];
        } finally {
            client.release();
        }
    }

    // Find user by username
    async findByUsername(username) {
        const client = await this.pool.connect();
        try {
            const result = await client.query(
                'SELECT * FROM users WHERE username = $1',
                [username]
            );
            
            return result.rows[0] || null;
        } finally {
            client.release();
        }
    }

    // Find user by email
    async findByEmail(email) {
        const client = await this.pool.connect();
        try {
            const result = await client.query(
                'SELECT * FROM users WHERE email = $1',
                [email]
            );
            
            return result.rows[0] || null;
        } finally {
            client.release();
        }
    }

    // Find user by ID
    async findById(id) {
        const client = await this.pool.connect();
        try {
            const result = await client.query(
                'SELECT * FROM users WHERE id = $1',
                [id]
            );
            
            return result.rows[0] || null;
        } finally {
            client.release();
        }
    }

    // Verify password
    verifyPassword(password, hashedPassword) {
        return bcrypt.compareSync(password, hashedPassword);
    }

    // Close database connection
    async close() {
        await this.pool.end();
    }
}

module.exports = User;
