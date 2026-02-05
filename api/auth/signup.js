import { initDB, findUserByEmail, createUser } from '../../lib/db.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        // Ensure DB is initialized
        await initDB();

        // Check if user already exists
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        await createUser({ email, password: hashedPassword });

        return res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Signup error details:', error);
        return res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
}
