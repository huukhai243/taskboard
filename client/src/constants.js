export const COLUMNS = [
  { id: 'todo', title: 'Cần làm' },
  { id: 'doing', title: 'Đang làm' },
  { id: 'done', title: 'Hoàn thành' },
];

export const PRIORITIES = [
  { id: 'high', label: 'Cao' },
  { id: 'medium', label: 'Trung bình' },
  { id: 'low', label: 'Thấp' },
];

export const PRIORITY_LABEL = Object.fromEntries(PRIORITIES.map((p) => [p.id, p.label]));
