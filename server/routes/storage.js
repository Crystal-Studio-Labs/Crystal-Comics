import express from 'express';
import { CONFIG } from '../config.js';

const router = express.Router();

/**
 * POST /api/storage/presigned-url
 * Generates an S3 presigned PUT URL for direct Cloudflare R2 uploads from the admin browser client.
 */
router.post('/presigned-url', async (req, res) => {
  try {
    const { mangaId, chapterId, filename } = req.body;

    if (!mangaId || !chapterId || !filename) {
      return res.status(400).json({ error: 'Missing mangaId, chapterId, or filename in request body' });
    }

    const objectKey = `chapters/${mangaId}/${chapterId}/${filename}`;
    
    // In production with real Cloudflare R2 credentials, use @aws-sdk/client-s3 + getSignedUrl
    // For template readiness, we construct the upload endpoint URL format:
    const uploadUrl = `${CONFIG.R2.PUBLIC_CDN_URL}/${objectKey}`;

    return res.json({
      success: true,
      uploadUrl,
      objectKey,
      publicCdnUrl: `${CONFIG.R2.PUBLIC_CDN_URL}/${objectKey}`
    });
  } catch (error) {
    console.error('[Server Storage Route] Error generating presigned URL:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
