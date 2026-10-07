// Các hàm gọi API của server Express (/api/tasks)

async function request(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error('Không kết nối được tới server');
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || `Không kết nối được tới server (mã lỗi ${res.status})`);
  }
  return data;
}

export const api = {
  list: () => request('/tasks'),
  create: (task) => request('/tasks', { method: 'POST', body: task }),
  update: (id, changes) => request(`/tasks/${id}`, { method: 'PATCH', body: changes }),
  move: (id, status, index) =>
    request(`/tasks/${id}/move`, { method: 'POST', body: { status, index } }),
  remove: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
};
