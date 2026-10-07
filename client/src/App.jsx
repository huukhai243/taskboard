import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from './api.js';
import { columnTasks, matchesFilter, moveTask } from './lib/tasks.js';
import Board from './components/Board.jsx';
import Header from './components/Header.jsx';
import TaskModal from './components/TaskModal.jsx';
import Toast from './components/Toast.jsx';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loadState, setLoadState] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({ query: '', priority: 'all' });
  // null = đóng hộp thoại; { task } = đang sửa; { status } = thêm mới vào cột status
  const [editing, setEditing] = useState(null);

  const loadTasks = useCallback(async () => {
    try {
      setTasks(await api.list());
      setLoadState('ready');
    } catch (err) {
      setError(err.message);
      setLoadState((s) => (s === 'ready' ? s : 'error'));
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const clearError = useCallback(() => setError(''), []);

  const visibleTasks = useMemo(
    () => tasks.filter((t) => matchesFilter(t, filter)),
    [tasks, filter],
  );
  const doneCount = tasks.filter((t) => t.status === 'done').length;
  const isFiltered = filter.query.trim() !== '' || filter.priority !== 'all';

  async function saveTask(data) {
    if (editing.task) {
      const updated = await api.update(editing.task.id, data);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } else {
      const created = await api.create(data);
      setTasks((prev) => [...prev, created]);
    }
    setEditing(null);
  }

  async function deleteTask(task) {
    if (!window.confirm(`Xoá công việc "${task.title}"?`)) return;
    try {
      await api.remove(task.id);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    } catch (err) {
      setError(err.message);
    }
  }

  // Chuyển công việc sang cột `status`, đặt ngay trước thẻ `beforeId` (null = cuối cột)
  async function handleMove(id, status, beforeId = null) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    // Tính vị trí trên toàn bộ cột (kể cả các thẻ đang bị ẩn bởi bộ lọc)
    const column = columnTasks(tasks, status);
    const others = column.filter((t) => t.id !== id);
    let index = beforeId ? others.findIndex((t) => t.id === beforeId) : -1;
    if (index === -1) index = others.length;
    if (task.status === status && column.indexOf(task) === index) return; // không đổi chỗ

    setTasks((prev) => moveTask(prev, id, status, index)); // cập nhật giao diện ngay
    try {
      await api.move(id, status, index);
    } catch (err) {
      setError(err.message);
      loadTasks(); // lỗi → lấy lại dữ liệu đúng từ server
    }
  }

  function retry() {
    setLoadState('loading');
    loadTasks();
  }

  return (
    <div className="app">
      <Header
        filter={filter}
        onFilterChange={setFilter}
        total={tasks.length}
        done={doneCount}
        onAdd={() => setEditing({ status: 'todo' })}
      />

      <main className="main">
        {loadState === 'loading' && <p className="state">Đang tải dữ liệu…</p>}

        {loadState === 'error' && (
          <div className="state">
            <p>Không tải được dữ liệu. Hãy kiểm tra server đã chạy chưa (npm run dev).</p>
            <button type="button" className="btn btn-primary" onClick={retry}>
              Thử lại
            </button>
          </div>
        )}

        {loadState === 'ready' && (
          <Board
            tasks={visibleTasks}
            filtered={isFiltered}
            onMove={handleMove}
            onEdit={(task) => setEditing({ task })}
            onDelete={deleteTask}
            onAdd={(status) => setEditing({ status })}
          />
        )}
      </main>

      {editing && (
        <TaskModal
          task={editing.task}
          defaultStatus={editing.status}
          onSave={saveTask}
          onClose={() => setEditing(null)}
        />
      )}

      {error && <Toast message={error} onClose={clearError} />}
    </div>
  );
}
