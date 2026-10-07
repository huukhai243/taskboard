import { PRIORITY_LABEL } from '../constants.js';
import { dueInfo } from '../lib/dates.js';
import { ArrowLeftIcon, ArrowRightIcon, CalendarIcon, EditIcon, TrashIcon } from './icons.jsx';

export default function TaskCard({
  task,
  isDragging,
  prevStatus,
  nextStatus,
  onDragStart,
  onDragEnd,
  onMove,
  onEdit,
  onDelete,
}) {
  const due = dueInfo(task);

  function handleDragStart(e) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id); // Firefox cần có dữ liệu thì mới cho kéo
    // Đợi trình duyệt chụp ảnh thẻ xong rồi mới làm mờ thẻ gốc
    setTimeout(() => onDragStart(task.id), 0);
  }

  function handleClick(e) {
    if (!e.target.closest('button')) onEdit(task);
  }

  return (
    <article
      className={`card${isDragging ? ' is-dragging' : ''}`}
      data-task-id={task.id}
      data-priority={task.priority}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onClick={handleClick}
    >
      <div className="card-top">
        <span className={`badge badge-${task.priority}`}>{PRIORITY_LABEL[task.priority]}</span>
        <div className="card-actions">
          {prevStatus && (
            <button
              type="button"
              className="icon-btn"
              title="Chuyển sang cột trước"
              aria-label="Chuyển sang cột trước"
              onClick={() => onMove(task.id, prevStatus)}
            >
              <ArrowLeftIcon />
            </button>
          )}
          {nextStatus && (
            <button
              type="button"
              className="icon-btn"
              title="Chuyển sang cột sau"
              aria-label="Chuyển sang cột sau"
              onClick={() => onMove(task.id, nextStatus)}
            >
              <ArrowRightIcon />
            </button>
          )}
          <button
            type="button"
            className="icon-btn"
            title="Sửa"
            aria-label={`Sửa "${task.title}"`}
            onClick={() => onEdit(task)}
          >
            <EditIcon />
          </button>
          <button
            type="button"
            className="icon-btn icon-btn-danger"
            title="Xoá"
            aria-label={`Xoá "${task.title}"`}
            onClick={() => onDelete(task)}
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      <h3 className="card-title">{task.title}</h3>
      {task.description && <p className="card-desc">{task.description}</p>}
      {due && (
        <p className={`card-due due-${due.tone}`}>
          <CalendarIcon />
          {due.label}
        </p>
      )}
    </article>
  );
}
