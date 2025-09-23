import { Prisma } from '@prisma/client';
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { serialize } from '../utils/serialization';
import { publicUserSelect } from '../utils/user';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { email, role, tipoUsuario, id } = req.query;

    const where: Prisma.UserWhereInput = {};

    if (email) {
      where.email = { contains: String(email), mode: Prisma.QueryMode.insensitive };
    }

    if (role) {
      where.role = String(role);
    }

    if (tipoUsuario) {
      where.tipoUsuario = String(tipoUsuario);
    }

    if (id) {
      where.id = String(id);
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdDate: 'desc' },
      select: publicUserSelect,
    });

    res.json(serialize(users));
  } catch (error) {
    next(error);
  }
});

router.get('/me', async (req, res, next) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: String(userId) },
      select: publicUserSelect,
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(serialize(user));
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(serialize(user));
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = (req.body ?? {}) as Prisma.UserUpdateInput & { password?: string };
    const updateData: Prisma.UserUpdateInput = { ...body };

    let nextPasswordHash: string | undefined;
    if (typeof body.password === 'string' && body.password.trim().length > 0) {
      nextPasswordHash = await bcrypt.hash(body.password, 10);
    }

    delete (updateData as Record<string, unknown>).password;

    if (nextPasswordHash) {
      (updateData as Prisma.UserUpdateInput).passwordHash = nextPasswordHash;
    } else {
      delete (updateData as Record<string, unknown>).passwordHash;
    }

    await prisma.user.update({
      where: { id },
      data: updateData,
    });

    const user = await prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });

    res.json(serialize(user));
  } catch (error) {
    next(error);
  }
});

export default router;

