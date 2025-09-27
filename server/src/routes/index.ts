import { Router } from 'express';
import restaurantsRouter from './restaurants';
import menuItemsRouter from './menu-items';
import ordersRouter from './orders';
import cartsRouter from './carts';
import customersRouter from './customers';
import entregadoresRouter from './entregadores';
import deliveriesRouter from './deliveries';
import alteracoesPerfilRouter from './alteracoes-perfil';
import usersRouter from './users';
import authRouter from './auth';
import paymentsRouter from './payments';

const router = Router();

router.use('/restaurants', restaurantsRouter);
router.use('/menu-items', menuItemsRouter);
router.use('/orders', ordersRouter);
router.use('/carts', cartsRouter);
router.use('/customers', customersRouter);
router.use('/entregadores', entregadoresRouter);
router.use('/deliveries', deliveriesRouter);
router.use('/alteracoes-perfil', alteracoesPerfilRouter);
router.use('/users', usersRouter);
router.use('/auth', authRouter);
router.use('/payments', paymentsRouter);

export default router;
