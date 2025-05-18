import express from 'express';
import Stripe from 'stripe';
import catchAsync from '../utils/catchAsync.js';
import { protect } from '../middleware/auth.js';
import { User } from '../entities/User.js';
import { AppDataSource } from '../config/database.js';


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const stripeRoutes = express.Router();

// Helper to ensure Stripe customer exists
const ensureStripeCustomer = catchAsync(async (req, res, next) => {
  const userRepository = AppDataSource.getRepository(User);

  if (!req.user.stripeCustomerId) {
    // Create customer in Stripe
    const customer = await stripe.customers.create({
      email: req.user.email,
      metadata: { userId: req.user.id },
    });

    // Save customer ID to DB
    req.user.stripeCustomerId = customer.id;
    await userRepository.update({ id: req.user.id }, { stripeCustomerId: customer.id });
  }

  next();
});

// 🟢 Create Setup Intent to add a card
stripeRoutes.post(
  '/setup-intent',
  protect,
  ensureStripeCustomer,
  catchAsync(async (req, res) => {
    const setupIntent = await stripe.setupIntents.create({
      customer: req.user.stripeCustomerId,
    });

    res.json({ clientSecret: setupIntent.client_secret });
  })
);

// 🟢 List Saved Cards
stripeRoutes.get(
  '/payment-methods',
  protect,
  ensureStripeCustomer,
  catchAsync(async (req, res) => {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: req.user.stripeCustomerId,
      type: 'card',
    });

    res.json(paymentMethods.data);
  })
);

// 🟢 Delete a Card
stripeRoutes.delete(
  '/payment-methods/:id',
  protect,
  catchAsync(async (req, res) => {
    const detached = await stripe.paymentMethods.detach(req.params.id);
    res.json(detached);
  })
);

// 🔵 (Optional) Create Customer explicitly if needed
stripeRoutes.post(
  '/create-customer',
  protect,
  catchAsync(async (req, res) => {
    const userRepository = AppDataSource.getRepository(User);

    if (req.user.stripeCustomerId) {
      return res.status(200).json({ customerId: req.user.stripeCustomerId });
    }

    const customer = await stripe.customers.create({
      email: req.user.email,
      metadata: { userId: req.user.id },
    });

    req.user.stripeCustomerId = customer.id;
    await userRepository.update({ id: req.user.id }, { stripeCustomerId: customer.id });

    res.status(200).json({ customerId: customer.id });
  })
);

export default stripeRoutes;
