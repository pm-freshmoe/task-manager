import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import useTaskStore from '../store/taskStore';
import SortableTask from './SortableTask';

const Column = ({ column }) => {
  const { tasks, addTask } = useTaskStore();
  
  const columnTasks = tasks.filter(task => task.columnId === column.id);
  
  const {
    isOver,
    setNodeRef
  } = useDroppable({
    id: column.id,
  });

  const handleAddTask = () => {
    addTask(column.id, 'New Task');
  };

  const getColumnClass = (columnId) => {
    const colorMap = {
      'todo': 'column-todo',
      'in-progress': 'column-in-progress', 
      'done': 'column-done',
      'backlog': 'column-backlog',
      'review': 'column-review',
      'deployed': 'column-deployed',
    };
    
    return colorMap[columnId] || 'column-default';
  };

  return (
    <div className={`column ${getColumnClass(column.id)}`}>
      <div className="column-header">
        <h2 className="column-title">{column.title}</h2>
        <span className="column-count">{columnTasks.length}</span>
      </div>
      
      <button
        onClick={handleAddTask}
        className="add-task-btn"
        onMouseDown={(e) => e.stopPropagation()}
      >
        + Add Task
      </button>

      <div
        ref={setNodeRef}
        className={`tasks-container ${isOver ? 'drag-over' : ''}`}
      >
        <SortableContext items={columnTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {columnTasks.map((task) => (
            <SortableTask key={task.id} task={task} />
          ))}
        </SortableContext>
        
        {columnTasks.length === 0 && !isOver && (
          <div className="empty-state">
            No tasks yet
          </div>
        )}
      </div>
    </div>
  );
};

export default Column;