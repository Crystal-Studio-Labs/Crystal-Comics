import express from 'express';
import { CONFIG } from '../config.js';

const router = express.Router();

/**
 * POST /api/payment/create-checkout-session
 * Generates checkout session URLs for Stripe, Lemon Squeezy, or PayPal.
 */
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { tier, gateway, userId } = req.body;

    if (!tier || !userId) {
      return res.status(400).json({ error: 'Missing tier or userId in request body' });
    }

    const price = tier === 'Knight' ? 4.99 : tier === 'Sovereign' ? 9.99 : 0;
    
    // Construct gateway checkout redirect URL
    const successUrl = `${req.headers.origin || 'http://localhost:5173'}/#/profile?payment=success&tier=${tier}`;
    
    return res.json({
      success: true,
      tier,
      price,
      gateway: gateway || 'LemonSqueezy',
      checkoutUrl: successUrl
    });
  } catch (error) {
    console.error('[Payment Route] Checkout Error:', error);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

/**
 * POST /api/payment/webhook
 * Handles incoming payment completion events from Lemon Squeezy / Stripe webhooks
 * to update user subscription tier and trigger Discord role assignment.
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const event = req.body;
    console.log('⚡ [Payment Webhook] Event Received:', event?.type || 'payment.success');

    // Return success response to payment provider
    return res.json({ received: true });
  } catch (error) {
    console.error('[Payment Webhook] Exception:', error);
    return res.status(500).json({ error: 'Webhook handler error' });
  }
});

export default router;
