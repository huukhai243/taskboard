import { existsSync } from 'node:fs';
import path from 'node:path';
import express from 'express';
import { tasksRouter } from './routes/tasks.js';

export function createApp(store, { clientDir } = {}) {
  const app = express();

  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (req, res) => {
    res.json({ ok: true });
  });

  app.use('/api/tasks', tasksRouter(store));

  app.use('/api', (req, res) => {
    res.status(404).json({ error: 'Không tìm thấy API' });
  });

  // Production: phục vụ luôn giao diện React đã build (client/dist)
  if (clientDir && existsSync(clientDir)) {
    app.use(express.static(clientDir));
    app.use((req, res, next) => {
      if (req.method !== 'GET') return next();
      res.sendFile(path.join(clientDir, 'index.html'));
    });
  }

  // Xử lý lỗi chung (JSON sai cú pháp, lỗi ghi file, ...)
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    const status = err.status || err.statusCode || 500;
    if (status >= 500) console.error(err);
    res.status(status).json({
      error: status >= 500 ? 'Lỗi máy chủ' : 'Dữ liệu gửi lên không hợp lệ',
    });
  });

  return app;
}
