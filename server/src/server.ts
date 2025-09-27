import app from './app';
import { env } from './env';
import { logger } from './lib/logger';

const port = env.PORT || 4000;

app.listen(port, () => {
  logger.info('AmaDelivery API running', { port });
});
