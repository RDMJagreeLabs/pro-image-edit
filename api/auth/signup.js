import { initDB, findUserByEmail, createUser } from '../../lib/db.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, password, username } = req.body;

    if (!email || !password || !username) {
        return res.status(400).json({ error: 'Email, password, and username are required' });
    }

    try {
        // Ensure DB is initialized
        await initDB();

        // Check if user already exists by email
        const existingEmail = await findUserByEmail(email);
        if (existingEmail) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Check if username already exists
        const existingUsername = await findUserByUsername(username);
        if (existingUsername) {
            return res.status(400).json({ error: 'Username already taken' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        await createUser({ email, password: hashedPassword, username });

        return res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Signup error details:', error);
        return res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
}
