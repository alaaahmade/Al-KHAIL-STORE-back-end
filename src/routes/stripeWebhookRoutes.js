import express from 'express';
import { handleStripeWebhook } from '../controllers/stripeWebhookController.js';
// import { handleStripeWebhook } from '../controllers/stripeWebhookController.js';

const stripeWebhookRoutes = express.Router();

// Stripe requires the raw body to validate signatures
// Stripe webhook endpoint (POST is used by Stripe)
stripeWebhookRoutes.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);
// Debug endpoint for manual testing (GET)
stripeWebhookRoutes.get('/webhook', (req, res) => {
  res.json({ status: 'ok', message: 'Stripe webhook endpoint is reachable. Use POST for real webhooks.' });
});

export default stripeWebhookRoutes;
