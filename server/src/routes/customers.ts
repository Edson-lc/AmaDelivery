import { Router } from 'express';
import prisma from '../lib/prisma';
import { serialize } from '../utils/serialization';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { telefone, email, nome, id } = req.query;

    const where: Record<string, unknown> = {};

    if (telefone) {
      where.telefone = String(telefone);
    }

    if (email) {
      where.email = String(email);
    }

    if (nome) {
      where.nome = { contains: String(nome), mode: 'insensitive' };
    }

    if (id) {
      where.id = String(id);
    }

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { createdDate: 'desc' },
    });

    res.json(serialize(customers));
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({ where: { id } });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(serialize(customer));
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const data = req.body ?? {};

    if (!data.nome || !data.telefone) {
      return res.status(400).json({ message: 'nome e telefone são obrigatórios.' });
    }

    const customer = await prisma.customer.create({ data });
    res.status(201).json(serialize(customer));
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body ?? {};

    const customer = await prisma.customer.update({
      where: { id },
      data,
    });

    res.json(serialize(customer));
  } catch (error) {
    next(error);
  }
});

export default router;
