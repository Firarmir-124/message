import { ConfigService } from '@config';
import path from 'node:path';
import { MessageService } from './message.service';

(async () => {
  console.log('Starting Message Service...');
  const config = new ConfigService(path.resolve(__dirname, '..'));
  const service = new MessageService(config);

  await service.start();

  process.on('SIGINT', async () => {
    console.log('Caught SIGINT, shutting down...');
    await service.shutdown();
    process.exit(0);
  });
})();
