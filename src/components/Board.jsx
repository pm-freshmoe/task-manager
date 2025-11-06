import React, { useState } from 'react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import useTaskStore from '../store/taskStore';
import Column from './Column'; // Remove SortableColumn import
import Task from './Task';
import ColumnManager from './ColumnManager';

const Board = () => {
  const { 
    columns, 
    tasks, 
    moveTaskBetweenColumns 
  } = useTaskStore();
  
  const [activeTask, setActiveTask] = useState(null);
  const [showColumnManager, setShowColumnManager] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find the active task
    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) return;

    // If dropping over a column
    const overColumn = columns.find(c => c.id === overId);
    if (overColumn) {
      if (activeTask.columnId !== overColumn.id) {
        // Move task to new column at the top
        moveTaskBetweenColumns(
          activeTask.columnId,
          overColumn.id,
          tasks.filter(t => t.columnId === activeTask.columnId).findIndex(t => t.id === activeId),
          0
        );
      }
      return;
    }

    // If dropping over a task
    const overTask = tasks.find(t => t.id === overId);
    if (overTask) {
      const activeColumnId = activeTask.columnId;
      const overColumnId = overTask.columnId;

      if (activeColumnId === overColumnId) {
        // Reorder within same column - handled by SortableContext
        return;
      } else {
        // Move between columns
        const sourceIndex = tasks.filter(t => t.columnId === activeColumnId).findIndex(t => t.id === activeId);
        const destinationIndex = tasks.filter(t => t.columnId === overColumnId).findIndex(t => t.id === overId);
        
        moveTaskBetweenColumns(
          activeColumnId,
          overColumnId,
          sourceIndex,
          destinationIndex
        );
      }
    }
  };

  const handleDragCancel = () => {
    setActiveTask(null);
  };

  return (
    <div className="board-container">
      <div className="board-header">
        <h1 className="board-title">Task Management Board</h1>
        <p className="board-subtitle">
          Drag and drop tasks between columns. Double-click to edit content.
        </p>
        
        <div className="board-actions">
          <button 
            onClick={() => setShowColumnManager(!showColumnManager)}
            className="manage-columns-btn"
          >
            {showColumnManager ? 'Hide Column Manager' : 'Manage Columns'}
          </button>
        </div>
      </div>

      {showColumnManager && (
        <div className="column-manager-container">
          <ColumnManager />
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="columns-container">
          {/* Remove SortableContext wrapper for columns */}
          {columns.map((column) => {
            const columnTasks = tasks.filter(task => task.columnId === column.id);
            return (
              <Column 
                key={column.id} 
                column={column}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeTask ? <Task task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default Board;