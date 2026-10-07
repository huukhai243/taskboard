import { useState } from 'react';
import { COLUMNS } from '../constants.js';
import { columnTasks } from '../lib/tasks.js';
import Column from './Column.jsx';

export default function Board({ tasks, filtered, onMove, onEdit, onDelete, onAdd }) {
  const [draggingId, setDraggingId] = useState(null);
  // Vị trí sẽ thả: { status, beforeId } — beforeId = null nghĩa là cuối cột
  const [dropTarget, setDropTarget] = useState(null);

  function endDrag() {
    setDraggingId(null);
    setDropTarget(null);
  }

  function updateDropTarget(status, beforeId) {
    setDropTarget((prev) =>
      prev?.status === status && prev.beforeId === beforeId ? prev : { status, beforeId },
    );
  }

  return (
    <div className="board">
      {COLUMNS.map((column, i) => (
        <Column
          key={column.id}
          column={column}
          tasks={columnTasks(tasks, column.id)}
          emptyText={filtered ? 'Không có công việc phù hợp' : 'Kéo thả công việc vào đây'}
          prevStatus={COLUMNS[i - 1]?.id}
          nextStatus={COLUMNS[i + 1]?.id}
          draggingId={draggingId}
          dropTarget={dropTarget?.status === column.id ? dropTarget : null}
          onDragStart={setDraggingId}
          onDragEnd={endDrag}
          onDragTarget={(beforeId) => updateDropTarget(column.id, beforeId)}
          onDragLeave={() => setDropTarget((prev) => (prev?.status === column.id ? null : prev))}
          onDrop={(beforeId) => {
            onMove(draggingId, column.id, beforeId);
            endDrag();
          }}
          onMove={onMove}
          onEdit={onEdit}
          onDelete={onDelete}
          onAdd={() => onAdd(column.id)}
        />
      ))}
    </div>
  );
}
