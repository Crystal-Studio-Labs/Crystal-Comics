import express from 'express';
import { CONFIG } from '../config.js';

const router = express.Router();

/**
 * POST /api/discord/linked-roles
 * Updates user metadata on Discord's Role Connections API endpoint.
 * Requires user's OAuth2 access token with `role_connections.write` scope.
 */
router.post('/linked-roles', async (req, res) => {
  try {
    const { accessToken, payload } = req.body;

    if (!accessToken || !payload) {
      return res.status(400).json({ error: 'Missing accessToken or payload in request body' });
    }

    const url = `https://discord.com/api/v10/users/@me/applications/${CONFIG.DISCORD.CLIENT_ID}/role-connection`;

    const discordRes = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!discordRes.ok) {
      const errorText = await discordRes.text();
      console.error('[Discord Linked Roles] API Error:', discordRes.status, errorText);
      return res.status(discordRes.status).json({ error: errorText });
    }

    const responseData = await discordRes.json();
    return res.json({ success: true, data: responseData });
  } catch (error) {
    console.error('[Discord Linked Roles] Route Exception:', error);
    return res.status(500).json({ error: 'Internal server error during Discord role sync' });
  }
});

export default router;
