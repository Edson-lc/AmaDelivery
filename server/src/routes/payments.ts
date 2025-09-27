import { Router } from 'express';
import Stripe from 'stripe';
import { env } from '../env';

const router = Router();

const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
    })
  : null;

router.post('/intent', async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ message: 'Stripe is not configured.' });
  }

  const { amount, currency = 'eur', customerEmail, metadata } = req.body ?? {};

  const normalizedAmount = Number(amount);

  if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
    return res.status(400).json({ message: 'amount must be a positive number of cents.' });
  }

  const paymentMetadata: Record<string, string> | undefined = metadata && typeof metadata === 'object'
    ? Object.entries(metadata).reduce<Record<string, string>>((acc, [key, value]) => {
        if (value === undefined || value === null) {
          return acc;
        }
        acc[String(key)] = String(value);
        return acc;
      }, {})
    : undefined;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(normalizedAmount),
      currency,
      automatic_payment_methods: { enabled: true },
      receipt_email: customerEmail ?? undefined,
      metadata: paymentMetadata,
    });

    return res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
    });
  } catch (error) {
    console.error('[payments] Failed to create payment intent', error);
    return res.status(500).json({ message: 'Failed to create payment intent.' });
  }
});

export default router;
