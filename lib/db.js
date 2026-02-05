import { sql } from '@vercel/postgres';

/**
 * Initializes the database schema if it doesn't exist.
 */
export async function initDB() {
    try {
        console.log('🗄️ Initializing database schema...');

        // Users Table
        await sql`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                username VARCHAR(50) UNIQUE,
                password VARCHAR(255),
                avatar_url TEXT,
                provider VARCHAR(50) DEFAULT 'email',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;

        // Ensure columns exist for existing tables
        try {
            await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;`;
            await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;`;
        } catch (alterError) {
            console.warn('⚠️ Alter table warning (could be expected if columns exist):', alterError.message);
        }

        // Images Table
        await sql`
            CREATE TABLE IF NOT EXISTS images (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                filename VARCHAR(255) NOT NULL,
                url TEXT NOT NULL,
                content_type VARCHAR(100),
                size INTEGER,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;

        console.log('✅ Database schema initialized');
    } catch (error) {
        console.error('❌ Database initialization error:', error);
        throw error;
    }
}

/**
 * Finds a user by email.
 */
export async function findUserByEmail(email) {
    try {
        await initDB();
        const { rows } = await sql`SELECT * FROM users WHERE email = ${email}`;
        return rows[0] || null;
    } catch (error) {
        console.error('findUserByEmail error:', error);
        throw error;
    }
}

/**
 * Finds a user by username.
 */
export async function findUserByUsername(username) {
    try {
        await initDB();
        const { rows } = await sql`SELECT * FROM users WHERE username = ${username}`;
        return rows[0] || null;
    } catch (error) {
        console.error('findUserByUsername error:', error);
        throw error;
    }
}

/**
 * Creates a new user.
 */
export async function createUser({ email, password, username = null, avatarUrl = null, provider = 'email' }) {
    try {
        const { rows } = await sql`
            INSERT INTO users (email, password, username, avatar_url, provider)
            VALUES (${email}, ${password}, ${username}, ${avatarUrl}, ${provider})
            RETURNING id, email, username, avatar_url, created_at, provider
        `;
        return rows[0];
    } catch (error) {
        console.error('createUser error:', error);
        throw error;
    }
}

/**
 * Finds a user by ID.
 */
export async function findUserById(id) {
    try {
        const { rows } = await sql`SELECT id, email, created_at, provider FROM users WHERE id = ${id}`;
        return rows[0] || null;
    } catch (error) {
        console.error('findUserById error:', error);
        throw error;
    }
}

/**
 * Saves image metadata.
 */
export async function saveImageMetadata({ userId, filename, url, contentType, size }) {
    try {
        const { rows } = await sql`
            INSERT INTO images (user_id, filename, url, content_type, size)
            VALUES (${userId}, ${filename}, ${url}, ${contentType}, ${size})
            RETURNING *
        `;
        return rows[0];
    } catch (error) {
        console.error('saveImageMetadata error:', error);
        throw error;
    }
}
