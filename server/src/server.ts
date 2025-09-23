import app from './app';
import { env } from './env';

const port = env.PORT || 4000;

app.listen(port, () => {
  console.log(`AmaEats API running on http://localhost:${port}`);
});
