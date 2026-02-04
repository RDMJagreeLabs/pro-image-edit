import { sql } from '@vercel/postgres';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const secret = process.env.JWT_SECRET || 'fallback_secret_change_me_in_vercel';
        const decoded = jwt.verify(token, secret);

        const result = await sql`SELECT email, created_at FROM users WHERE id = ${decoded.userId}`;
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];

        return res.status(200).json({
            user: {
                id: decoded.userId,
                email: user.email,
                createdAt: user.created_at
            }
        });
    } catch (error) {
        console.error('Me error:', error);
        return res.status(401).json({ error: 'Invalid token' });
    }
}
