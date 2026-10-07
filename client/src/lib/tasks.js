// Các công việc của một cột, sắp xếp theo vị trí
export function columnTasks(tasks, status) {
  return tasks.filter((t) => t.status === status).sort((a, b) => a.order - b.order);
}

// Di chuyển công việc tới vị trí `index` của cột `status` — cùng cách tính với server
export function moveTask(tasks, id, status, index) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return tasks;

  const orders = new Map();
  const target = columnTasks(tasks, status).filter((t) => t.id !== id);
  target.splice(Math.min(index, target.length), 0, task);
  target.forEach((t, i) => orders.set(t.id, i));

  if (task.status !== status) {
    columnTasks(tasks, task.status)
      .filter((t) => t.id !== id)
      .forEach((t, i) => orders.set(t.id, i));
  }

  return tasks.map((t) => {
    if (t.id === id) return { ...t, status, order: orders.get(id) };
    const order = orders.get(t.id);
    return order === undefined || order === t.order ? t : { ...t, order };
  });
}

// Bỏ dấu tiếng Việt để gõ "thiet ke" vẫn tìm ra "Thiết kế"
function normalize(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

export function matchesFilter(task, { query, priority }) {
  if (priority !== 'all' && task.priority !== priority) return false;
  const q = normalize(query.trim());
  return !q || normalize(`${task.title} ${task.description}`).includes(q);
}
