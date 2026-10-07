import { useEffect, useRef, useState } from 'react';
import { COLUMNS, PRIORITIES } from '../constants.js';
import { CloseIcon } from './icons.jsx';

// Hộp thoại thêm mới (task = undefined) hoặc sửa công việc
export default function TaskModal({ task, defaultStatus = 'todo', onSave, onClose }) {
  const dialogRef = useRef(null);
  const titleRef = useRef(null);
  const pressedOnBackdrop = useRef(false);
  const [form, setForm] = useState(() => ({
    title: task?.title ?? '',
    description: task?.description ?? '',
    priority: task?.priority ?? 'medium',
    status: task?.status ?? defaultStatus,
    dueDate: task?.dueDate ?? '',
  }));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    titleRef.current.focus();
    return () => dialog.close();
  }, []);

  const bind = (field) => ({
    value: form[field],
    onChange: (e) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setError('');
    },
  });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Vui lòng nhập tiêu đề');
      titleRef.current.focus();
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave({ ...form, title: form.title.trim(), dueDate: form.dueDate || null });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      aria-labelledby="modal-title"
      onCancel={(e) => {
        e.preventDefault(); // phím Esc: để React tự đóng hộp thoại
        onClose();
      }}
      onMouseDown={(e) => {
        pressedOnBackdrop.current = e.target === dialogRef.current;
      }}
      onClick={(e) => {
        // Bấm ra vùng tối bên ngoài để đóng
        if (pressedOnBackdrop.current && e.target === dialogRef.current) onClose();
      }}
    >
      <form className="modal-form" onSubmit={handleSubmit} noValidate>
        <div className="modal-header">
          <h2 id="modal-title">{task ? 'Sửa công việc' : 'Thêm công việc'}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Đóng">
            <CloseIcon />
          </button>
        </div>

        <div className="field">
          <label htmlFor="task-title">
            Tiêu đề <span className="required">*</span>
          </label>
          <input
            id="task-title"
            ref={titleRef}
            maxLength={120}
            placeholder="VD: Thiết kế trang đăng nhập"
            {...bind('title')}
          />
        </div>

        <div className="field">
          <label htmlFor="task-description">Mô tả</label>
          <textarea
            id="task-description"
            rows={4}
            maxLength={2000}
            placeholder="Chi tiết công việc…"
            {...bind('description')}
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="task-priority">Độ ưu tiên</label>
            <select id="task-priority" {...bind('priority')}>
              {PRIORITIES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="task-status">Trạng thái</label>
            <select id="task-status" {...bind('status')}>
              {COLUMNS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="task-due">Hạn chót</label>
            <input id="task-due" type="date" {...bind('dueDate')} />
          </div>
        </div>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Huỷ
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Đang lưu…' : task ? 'Lưu thay đổi' : 'Thêm công việc'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
