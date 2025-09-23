import { Router } from 'express';
import prisma from '../lib/prisma';
import { serialize } from '../utils/serialization';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { sessionId, restaurantId, id } = req.query;

    const where: Record<string, unknown> = {};

    if (sessionId) {
      where.sessionId = String(sessionId);
    }

    if (restaurantId) {
      where.restaurantId = String(restaurantId);
    }

    if (id) {
      where.id = String(id);
    }

    const carts = await prisma.cart.findMany({
      where,
      orderBy: { updatedDate: 'desc' },
    });

    res.json(serialize(carts));
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const cart = await prisma.cart.findUnique({ where: { id } });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    res.json(serialize(cart));
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const data = req.body ?? {};

    if (!data.sessionId || !data.restaurantId) {
      return res.status(400).json({ message: 'sessionId and restaurantId are required.' });
    }

    const cart = await prisma.cart.create({
      data,
    });

    res.status(201).json(serialize(cart));
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body ?? {};

    const cart = await prisma.cart.update({
      where: { id },
      data,
    });

    res.json(serialize(cart));
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.cart.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
