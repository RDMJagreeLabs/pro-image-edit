import { initDB, findUserByEmail, createUser } from '../../lib/db.js';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, provider, name } = req.body;

    if (!email || !provider) {
        return res.status(400).json({ error: 'Email and provider are required' });
    }

    try {
        await initDB();

        let user = await findUserByEmail(email);

        if (user) {
            // Update provider if it was email or something else? 
            // For now, just accept it.
        } else {
            // Create new social user
            user = await createUser({
                email,
                password: null, // Social users don't have passwords
                provider
            });
        }

        // Generate JWT
        const secret = process.env.JWT_SECRET || 'fallback_secret_change_me_in_vercel';
        const token = jwt.sign(
            { userId: user.id, email: user.email, provider: user.provider },
            secret,
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                createdAt: user.created_at,
                provider: user.provider
            }
        });
    } catch (error) {
        console.error('Social auth error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
}
