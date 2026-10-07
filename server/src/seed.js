// Dữ liệu mẫu cho lần chạy đầu tiên (khi chưa có file data/db.json)

function dayFromToday(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function sampleTasks() {
  return [
    {
      title: 'Viết README hướng dẫn cài đặt',
      description: 'Ghi lại các bước cài đặt, chạy dự án và danh sách API.',
      priority: 'low',
      status: 'todo',
      dueDate: dayFromToday(5),
    },
    {
      title: 'Thêm tìm kiếm và bộ lọc',
      description: 'Tìm theo tiêu đề/mô tả (không phân biệt dấu), lọc theo độ ưu tiên.',
      priority: 'medium',
      status: 'todo',
      dueDate: dayFromToday(3),
    },
    {
      title: 'Triển khai lên server',
      description: '',
      priority: 'low',
      status: 'todo',
      dueDate: null,
    },
    {
      title: 'Làm giao diện bảng Kanban',
      description: 'Ba cột Cần làm / Đang làm / Hoàn thành, hỗ trợ kéo thả giữa các cột.',
      priority: 'high',
      status: 'doing',
      dueDate: dayFromToday(0),
    },
    {
      title: 'Kết nối giao diện với API',
      description: 'Gọi các endpoint /api/tasks bằng fetch.',
      priority: 'high',
      status: 'doing',
      dueDate: dayFromToday(1),
    },
    {
      title: 'Thiết kế API công việc',
      description: 'GET, POST, PATCH, DELETE cho /api/tasks và endpoint di chuyển thẻ.',
      priority: 'medium',
      status: 'done',
      dueDate: dayFromToday(-1),
    },
    {
      title: 'Khởi tạo dự án React + Express',
      description: '',
      priority: 'medium',
      status: 'done',
      dueDate: null,
    },
  ];
}
