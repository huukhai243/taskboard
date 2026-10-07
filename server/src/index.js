import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { createStore } from './store.js';
import { sampleTasks } from './seed.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3001;
const DATA_FILE = process.env.DATA_FILE || path.join(here, '../data/db.json');

const store = await createStore(DATA_FILE, { seed: sampleTasks() });
const app = createApp(store, { clientDir: path.join(here, '../../client/dist') });

app.listen(PORT, (err) => {
  if (err) {
    console.error(
      err.code === 'EADDRINUSE' ? `Cổng ${PORT} đang được dùng bởi chương trình khác.` : err,
    );
    process.exit(1);
  }
  console.log(`API đang chạy tại http://localhost:${PORT}/api`);
});
