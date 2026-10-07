const pad = (n) => String(n).padStart(2, '0');

// Ngày hôm nay theo giờ máy, dạng YYYY-MM-DD
export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// 2026-10-07 → 07/10/2026
export function formatDate(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// Nhãn và màu hiển thị cho hạn chót của công việc
export function dueInfo(task) {
  if (!task.dueDate) return null;
  const label = formatDate(task.dueDate);
  if (task.status === 'done') return { tone: 'muted', label };

  const today = todayISO();
  if (task.dueDate < today) return { tone: 'overdue', label: `${label} · Quá hạn` };
  if (task.dueDate === today) return { tone: 'today', label: 'Hôm nay' };
  return { tone: 'normal', label };
}
