import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { serialize } from '../utils/serialization';
import { publicUserSelect } from '../utils/user';

const router = Router();

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: String(email).toLowerCase() },
    });

    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const isValid = await bcrypt.compare(String(password), user.passwordHash);

    if (!isValid) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const now = new Date();

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { updatedDate: now },
      }),
      ...(user.tipoUsuario === 'entregador'
        ? [
            prisma.entregador.updateMany({
              where: { userId: user.id },
              data: { ultimoLogin: now },
            }),
          ]
        : []),
    ]);

    const publicUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: publicUserSelect,
    });

    res.json(serialize(publicUser));
  } catch (error) {
    next(error);
  }
});

router.post('/logout', (_req, res) => {
  res.status(204).send();
});

export default router;
