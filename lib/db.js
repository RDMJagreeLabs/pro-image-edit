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
                password VARCHAR(255),
                provider VARCHAR(50) DEFAULT 'email',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;

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
 * Creates a new user.
 */
export async function createUser({ email, password, provider = 'email' }) {
    try {
        const { rows } = await sql`
            INSERT INTO users (email, password, provider)
            VALUES (${email}, ${password}, ${provider})
            RETURNING id, email, created_at
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
