import { Router } from 'express';
import { validateMove, validateTask } from '../validate.js';

function badRequest(res, errors) {
  res.status(400).json({ error: errors.join('. '), errors });
}

function notFound(res) {
  res.status(404).json({ error: 'Không tìm thấy công việc' });
}

export function tasksRouter(store) {
  const router = Router();

  // GET /api/tasks — toàn bộ công việc, sắp theo cột và vị trí
  router.get('/', (req, res) => {
    res.json(store.list());
  });

  // GET /api/tasks/:id
  router.get('/:id', (req, res) => {
    const task = store.get(req.params.id);
    if (!task) return notFound(res);
    res.json(task);
  });

  // POST /api/tasks — tạo công việc mới
  router.post('/', async (req, res) => {
    const { value, errors } = validateTask(req.body);
    if (errors.length) return badRequest(res, errors);
    res.status(201).json(await store.create(value));
  });

  // PATCH /api/tasks/:id — sửa một vài trường
  router.patch('/:id', async (req, res) => {
    const { value, errors } = validateTask(req.body, { partial: true });
    if (errors.length) return badRequest(res, errors);
    const task = await store.update(req.params.id, value);
    if (!task) return notFound(res);
    res.json(task);
  });

  // POST /api/tasks/:id/move — kéo thả: { status, index }
  router.post('/:id/move', async (req, res) => {
    const { value, errors } = validateMove(req.body);
    if (errors.length) return badRequest(res, errors);
    const tasks = await store.move(req.params.id, value.status, value.index);
    if (!tasks) return notFound(res);
    res.json(tasks);
  });

  // DELETE /api/tasks/:id
  router.delete('/:id', async (req, res) => {
    const removed = await store.remove(req.params.id);
    if (!removed) return notFound(res);
    res.status(204).end();
  });

  return router;
}
