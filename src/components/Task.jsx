import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import useTaskStore from '../store/taskStore';
import InlineEditor from './InlineEditor';

const Task = ({ task }) => {
  const { updateTask, deleteTask } = useTaskStore();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const handleContentSave = (newContent) => {
    updateTask(task.id, newContent);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    deleteTask(task.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`task ${isDragging ? 'dragging' : ''}`}
    >
      <div className="task-header">
        <div className="task-content">
          <InlineEditor
            value={task.content}
            onSave={handleContentSave}
            placeholder="Enter task description..."
          />
        </div>
        <button
          onClick={handleDelete}
          className="delete-btn"
          title="Delete task"
          onMouseDown={(e) => e.stopPropagation()}
        >
          ×
        </button>
      </div>
      <div className="task-meta">
        <span className="task-date">
          {new Date(task.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

export default Task;