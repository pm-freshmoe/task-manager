import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useTaskStore from '../store/taskStore';

// Sortable Column Item Component
const SortableColumnItem = ({ column, onEdit, onDelete, canDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`column-item ${isDragging ? 'dragging' : ''}`}
    >
      <div className="view-mode">
        <div className="drag-handle">
          <span>⋮⋮</span>
        </div>
        <span className="column-title-text">{column.title}</span>
        <div className="column-actions">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(column);
            }}
            className="edit-btn"
            title="Edit column title"
          >
            Edit
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(column.id);
            }}
            className="delete-btn"
            title="Delete column"
            disabled={!canDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Column Manager Component
const ColumnManager = () => {
  const { columns, addColumn, deleteColumn, updateColumn, moveColumn, resetBoard } = useTaskStore();
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [editingColumn, setEditingColumn] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      addColumn(newColumnTitle);
      setNewColumnTitle('');
    }
  };

  const handleStartEdit = (column) => {
    setEditingColumn(column.id);
    setEditTitle(column.title);
  };

  const handleSaveEdit = (columnId) => {
    if (editTitle.trim()) {
      updateColumn(columnId, editTitle);
    }
    setEditingColumn(null);
    setEditTitle('');
  };

  const handleCancelEdit = () => {
    setEditingColumn(null);
    setEditTitle('');
  };

  const handleKeyPress = (e, columnId) => {
    if (e.key === 'Enter') {
      handleSaveEdit(columnId);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId !== overId) {
      const activeIndex = columns.findIndex(col => col.id === activeId);
      const overIndex = columns.findIndex(col => col.id === overId);
      
      moveColumn(activeIndex, overIndex);
    }
  };

  const canDelete = columns.length > 1;

  return (
    <div className="column-manager">
      <div className="manager-header">
        <h3>Manage Columns</h3>
        <p className="manager-subtitle">Drag handles (⋮⋮) to reorder columns</p>
      </div>
      
      <div className="add-column-section">
        <input
          type="text"
          value={newColumnTitle}
          onChange={(e) => setNewColumnTitle(e.target.value)}
          placeholder="Enter new column title"
          className="column-input"
          onKeyPress={(e) => e.key === 'Enter' && handleAddColumn()}
        />
        <button 
          onClick={handleAddColumn}
          className="add-column-btn"
          disabled={!newColumnTitle.trim()}
        >
          Add Column
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="columns-list">
          <SortableContext items={columns.map(c => c.id)} strategy={verticalListSortingStrategy}>
            {columns.map((column) => (
              editingColumn === column.id ? (
                <div key={column.id} className="column-item edit-mode">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, column.id)}
                    className="edit-input"
                    autoFocus
                  />
                  <button 
                    onClick={() => handleSaveEdit(column.id)}
                    className="save-btn"
                  >
                    ✓
                  </button>
                  <button 
                    onClick={handleCancelEdit}
                    className="cancel-btn"
                  >
                    ✗
                  </button>
                </div>
              ) : (
                <SortableColumnItem
                  key={column.id}
                  column={column}
                  onEdit={handleStartEdit}
                  onDelete={deleteColumn}
                  canDelete={canDelete}
                />
              )
            ))}
          </SortableContext>
        </div>
      </DndContext>

      <div className="manager-actions">
        <button 
          onClick={resetBoard}
          className="reset-btn"
          title="Reset to default columns and clear all tasks"
        >
          Reset Board
        </button>
      </div>
    </div>
  );
};

export default ColumnManager;