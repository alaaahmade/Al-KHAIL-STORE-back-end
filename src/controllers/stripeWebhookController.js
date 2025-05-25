import Stripe from 'stripe';
import { AppDataSource } from '../config/database.js';
import { Cart, User } from '../entities/index.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const cartId = session.metadata.cartId;
    const userId = session.metadata.userId;
    const cartRepository = AppDataSource.getRepository(Cart);
    const userRepository = AppDataSource.getRepository(User);

    // 1. Mark the cart as checked out
    const cart = await cartRepository.findOne({ where: { id: cartId } });
    if (cart) {
      cart.status = 'checked_out';
      await cartRepository.save(cart);
    }

    // 2. Create a new empty cart for the user
    if (userId) {
      const newCart = cartRepository.create({
        userId: userId,
        status: 'active',
        total: 0,
      });
      await cartRepository.save(newCart);
    }
  }

  res.status(200).json({ received: true });
};
