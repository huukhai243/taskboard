import { Fragment } from 'react';
import TaskCard from './TaskCard.jsx';
import { PlusIcon } from './icons.jsx';

// Tìm thẻ đầu tiên nằm dưới con trỏ chuột → thả vào ngay trước thẻ đó (null = cuối cột)
function findBeforeId(container, clientY, draggingId) {
  for (const el of container.querySelectorAll('[data-task-id]')) {
    if (el.dataset.taskId === draggingId) continue;
    const { top, height } = el.getBoundingClientRect();
    if (clientY < top + height / 2) return el.dataset.taskId;
  }
  return null;
}

export default function Column({
  column,
  tasks,
  emptyText,
  prevStatus,
  nextStatus,
  draggingId,
  dropTarget,
  onDragStart,
  onDragEnd,
  onDragTarget,
  onDragLeave,
  onDrop,
  onMove,
  onEdit,
  onDelete,
  onAdd,
}) {
  function handleDragOver(e) {
    if (!draggingId) return; // không phải đang kéo thẻ công việc (vd kéo file từ ngoài vào)
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    onDragTarget(findBeforeId(e.currentTarget, e.clientY, draggingId));
  }

  function handleDragLeave(e) {
    // Bỏ qua khi chỉ di chuyển giữa các phần tử con bên trong cột
    if (!e.currentTarget.contains(e.relatedTarget)) onDragLeave();
  }

  function handleDrop(e) {
    if (!draggingId) return;
    e.preventDefault();
    onDrop(findBeforeId(e.currentTarget, e.clientY, draggingId));
  }

  return (
    <section
      className={`column column-${column.id}${dropTarget ? ' is-over' : ''}`}
      aria-labelledby={`column-${column.id}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <header className="column-header">
        <span className="column-dot" />
        <h2 id={`column-${column.id}`}>{column.title}</h2>
        <span className="column-count">{tasks.length}</span>
      </header>

      <div className="column-body">
        {tasks.map((task) => (
          <Fragment key={task.id}>
            {dropTarget?.beforeId === task.id && <div className="drop-indicator" />}
            <TaskCard
              task={task}
              isDragging={draggingId === task.id}
              prevStatus={prevStatus}
              nextStatus={nextStatus}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onMove={onMove}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </Fragment>
        ))}
        {dropTarget?.beforeId === null && <div className="drop-indicator" />}
        {tasks.length === 0 && !dropTarget && <p className="column-empty">{emptyText}</p>}
      </div>

      <button type="button" className="column-add" onClick={onAdd}>
        <PlusIcon />
        Thêm công việc
      </button>
    </section>
  );
}
