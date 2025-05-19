import express from 'express';
import Stripe from 'stripe';
import { AppDataSource } from '../config/database.js';
import { Cart } from '../entities/Cart.js';
import { Order } from '../entities/Order.js';
import { User } from '../entities/User.js';
import { CartItem } from '../entities/CartItem.js';
import orderService from '../services/orderService.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const webhookRouter = express.Router();

webhookRouter.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    try {
      // Find the user and cart from metadata
      const userId = session.metadata.userId;
      const cartId = session.metadata.cartId;
      const cartRepository = AppDataSource.getRepository(Cart);
      const cart = await cartRepository.findOne({
        where: { id: cartId },
        relations: ['items', 'items.product'],
      });
      if (!cart) throw new Error('Cart not found');

      // Prepare order data
      const orderData = {
        orderNumber: `ORD-${Date.now()}`,
        orderStatus: 'PAID',
        orderDate: new Date(),
        cartId: cart.id,
        paymentInfo: session.payment_intent || session.id,
        country: session.shipping?.address?.country || '',
        city: session.shipping?.address?.city || '',
        streetAddress: session.shipping?.address?.line1 || '',
        userId: userId,
        phoneNumber: session.customer_details?.phone || '',
        email: session.customer_details?.email || session.customer_email || '',
        stripeSessionId: session.id,
      };
      // Save order
      await orderService.createOrder(orderData);

      // Empty cart
      const cartItemRepository = AppDataSource.getRepository(CartItem);
      await cartItemRepository.delete({ cartId: cart.id });
    } catch (err) {
      console.error('Error processing checkout.session.completed:', err);
      return res.status(500).send('Internal webhook error');
    }
  }

  res.status(200).json({ received: true });
});

export default webhookRouter;
