import { put } from '@vercel/blob';
import { saveImageMetadata, initDB } from '../lib/db.js';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
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
        const userId = decoded.userId;

        const { filename, contentType, dataUrl } = req.body;

        if (!dataUrl) {
            return res.status(400).json({ error: 'Image data is required' });
        }

        // Convert data URL to buffer
        const base64Data = dataUrl.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');

        // Upload to Vercel Blob
        const blob = await put(filename || `image-${Date.now()}.png`, buffer, {
            contentType: contentType || 'image/png',
            access: 'public',
        });

        // Ensure DB is initialized
        await initDB();

        // Save image metadata
        await saveImageMetadata({
            userId,
            filename: filename || 'unnamed',
            url: blob.url,
            contentType: contentType || 'image/png',
            size: buffer.length
        });

        return res.status(200).json(blob);
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ error: 'Upload failed', details: error.message });
    }
}
