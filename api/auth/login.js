import { findUserByEmail } from '../../lib/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { identifier, password } = req.body;

    if (!identifier || !password) {
        return res.status(400).json({ error: 'Identifier (email/username) and password are required' });
    }

    try {
        // Find user by email or username
        let user = await findUserByEmail(identifier);
        if (!user) {
            user = await findUserByUsername(identifier);
        }

        if (!user || !user.password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT
        const secret = process.env.JWT_SECRET || 'fallback_secret_change_me_in_vercel';
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            secret,
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                createdAt: user.created_at
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
}
