import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { STATUSES } from './constants.js';

/**
 * Kho dữ liệu đơn giản: giữ danh sách công việc trong bộ nhớ
 * và ghi ra file JSON sau mỗi lần thay đổi.
 *
 * Mỗi công việc có `status` (cột) và `order` (vị trí trong cột).
 */
export async function createStore(filePath, { seed = [] } = {}) {
  let tasks = await readTasks(filePath);
  let queue = Promise.resolve();

  const now = () => new Date().toISOString();
  const findTask = (id) => tasks.find((t) => t.id === id);

  // Các công việc trong một cột, đã sắp xếp theo vị trí
  const column = (status) =>
    tasks.filter((t) => t.status === status).sort((a, b) => a.order - b.order);

  const renumber = (list) => list.forEach((t, i) => (t.order = i));

  // Ghi file tuần tự để các lần ghi không chồng lên nhau
  function persist() {
    const data = JSON.stringify({ tasks }, null, 2);
    const job = queue.then(() => writeFileAtomic(filePath, data));
    queue = job.catch(() => {});
    return job;
  }

  function addTask(input) {
    const status = input.status ?? 'todo';
    const last = column(status).at(-1);
    const time = now();
    const task = {
      id: randomUUID(),
      title: input.title,
      description: input.description ?? '',
      priority: input.priority ?? 'medium',
      status,
      dueDate: input.dueDate ?? null,
      order: last ? last.order + 1 : 0,
      createdAt: time,
      updatedAt: time,
    };
    tasks.push(task);
    return task;
  }

  // Đặt công việc vào cột `status` tại vị trí `index`, đánh số lại các cột bị ảnh hưởng
  function placeTask(task, status, index) {
    const from = task.status;
    const target = column(status).filter((t) => t.id !== task.id);
    target.splice(Math.min(Math.max(index, 0), target.length), 0, task);
    task.status = status;
    renumber(target);
    if (from !== status) renumber(column(from));
  }

  const list = () => STATUSES.flatMap((status) => column(status));

  // Lần chạy đầu tiên: chưa có file dữ liệu → tạo từ dữ liệu mẫu
  if (tasks === null) {
    tasks = [];
    seed.forEach(addTask);
    await persist();
  }

  return {
    list,

    get(id) {
      return findTask(id) ?? null;
    },

    async create(input) {
      const task = addTask(input);
      await persist();
      return task;
    },

    async update(id, changes) {
      const task = findTask(id);
      if (!task) return null;
      const { status, ...fields } = changes;
      Object.assign(task, fields);
      // Đổi cột qua form sửa → đưa xuống cuối cột mới
      if (status && status !== task.status) placeTask(task, status, Infinity);
      task.updatedAt = now();
      await persist();
      return task;
    },

    async move(id, status, index) {
      const task = findTask(id);
      if (!task) return null;
      placeTask(task, status, index);
      task.updatedAt = now();
      await persist();
      return list();
    },

    async remove(id) {
      const task = findTask(id);
      if (!task) return false;
      tasks = tasks.filter((t) => t !== task);
      renumber(column(task.status));
      await persist();
      return true;
    },
  };
}

async function readTasks(filePath) {
  try {
    const { tasks } = JSON.parse(await fs.readFile(filePath, 'utf8'));
    return Array.isArray(tasks) ? tasks : [];
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw new Error(`Không đọc được file dữ liệu ${filePath}: ${err.message}`);
  }
}

// Ghi ra file tạm rồi đổi tên, tránh làm hỏng file nếu server bị tắt giữa chừng
async function writeFileAtomic(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const tmp = `${filePath}.tmp`;
  await fs.writeFile(tmp, data, 'utf8');
  await fs.rename(tmp, filePath);
}
