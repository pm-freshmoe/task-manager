import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useTaskStore = create(
  persist(
    (set, get) => ({
      tasks: [],
      columns: [
        { id: 'todo', title: 'To Do' },
        { id: 'in-progress', title: 'In Progress' },
        { id: 'done', title: 'Done' }
      ],
      
      // Add a new task
      addTask: (columnId, content = 'New Task') => {
        const newTask = {
          id: Date.now().toString(),
          content,
          columnId,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          tasks: [...state.tasks, newTask]
        }));
        return newTask.id;
      },
      
      // Update task content
      updateTask: (taskId, content) => {
        set((state) => ({
          tasks: state.tasks.map(task =>
            task.id === taskId ? { ...task, content } : task
          )
        }));
      },
      
      // Move task between columns
      moveTask: (taskId, newColumnId) => {
        set((state) => ({
          tasks: state.tasks.map(task =>
            task.id === taskId ? { ...task, columnId: newColumnId } : task
          )
        }));
      },
      
      // Delete task
      deleteTask: (taskId) => {
        set((state) => ({
          tasks: state.tasks.filter(task => task.id !== taskId)
        }));
      },
      
      // Reorder tasks within a column
      reorderTasks: (columnId, startIndex, endIndex) => {
        const { tasks } = get();
        const columnTasks = tasks.filter(task => task.columnId === columnId).sort((a, b) => {
          return tasks.indexOf(a) - tasks.indexOf(b);
        });
        const otherTasks = tasks.filter(task => task.columnId !== columnId);
        
        const [removed] = columnTasks.splice(startIndex, 1);
        columnTasks.splice(endIndex, 0, removed);
        
        set({ tasks: [...otherTasks, ...columnTasks] });
      },
      
      // Move task between columns with reordering
      moveTaskBetweenColumns: (sourceColumnId, destinationColumnId, sourceIndex, destinationIndex) => {
        const { tasks } = get();
        
        const sourceTasks = tasks.filter(task => task.columnId === sourceColumnId).sort((a, b) => {
          return tasks.indexOf(a) - tasks.indexOf(b);
        });
        const destTasks = tasks.filter(task => task.columnId === destinationColumnId).sort((a, b) => {
          return tasks.indexOf(a) - tasks.indexOf(b);
        });
        const otherTasks = tasks.filter(task => 
          task.columnId !== sourceColumnId && task.columnId !== destinationColumnId
        );
        
        const [movedTask] = sourceTasks.splice(sourceIndex, 1);
        movedTask.columnId = destinationColumnId;
        destTasks.splice(destinationIndex, 0, movedTask);
        
        set({ tasks: [...otherTasks, ...sourceTasks, ...destTasks] });
      },

      // COLUMN MANAGEMENT METHODS
      
      // Add a new column
      addColumn: (title = 'New Column') => {
        const newColumn = {
          id: `column-${Date.now()}`,
          title: title.trim() || 'New Column',
        };
        set((state) => ({
          columns: [...state.columns, newColumn]
        }));
        return newColumn.id;
      },
      
      // Update column title
      updateColumn: (columnId, newTitle) => {
        set((state) => ({
          columns: state.columns.map(column =>
            column.id === columnId ? { ...column, title: newTitle.trim() || column.title } : column
          )
        }));
      },
      
      // Delete a column and all its tasks
      deleteColumn: (columnId) => {
        const { tasks } = get();
        
        // Filter out tasks that belong to the deleted column
        const filteredTasks = tasks.filter(task => task.columnId !== columnId);
        
        set((state) => ({
          columns: state.columns.filter(column => column.id !== columnId),
          tasks: filteredTasks
        }));
      },
      
      // Reorder columns
      moveColumn: (fromIndex, toIndex) => {
        set((state) => {
          const newColumns = [...state.columns];
          const [movedColumn] = newColumns.splice(fromIndex, 1);
          newColumns.splice(toIndex, 0, movedColumn);
          return { columns: newColumns };
        });
      },

      // Clear all tasks from a column
      clearColumn: (columnId) => {
        set((state) => ({
          tasks: state.tasks.filter(task => task.columnId !== columnId)
        }));
      },

      // Duplicate a column with all its tasks
      duplicateColumn: (columnId) => {
        const { columns, tasks } = get();
        const columnToDuplicate = columns.find(col => col.id === columnId);
        
        if (!columnToDuplicate) return;
        
        const newColumn = {
          id: `column-${Date.now()}`,
          title: `${columnToDuplicate.title} (Copy)`,
        };
        
        // Duplicate tasks from the original column
        const columnTasks = tasks.filter(task => task.columnId === columnId);
        const duplicatedTasks = columnTasks.map(task => ({
          ...task,
          id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          columnId: newColumn.id,
          createdAt: new Date().toISOString(),
        }));
        
        set((state) => ({
          columns: [...state.columns, newColumn],
          tasks: [...state.tasks, ...duplicatedTasks]
        }));
        
        return newColumn.id;
      },

      // Reset entire board (clear all tasks and reset to default columns)
      resetBoard: () => {
        set({
          tasks: [],
          columns: [
            { id: 'todo', title: 'To Do' },
            { id: 'in-progress', title: 'In Progress' },
            { id: 'done', title: 'Done' }
          ]
        });
      },

      // Import data (for backup/restore functionality)
      importData: (data) => {
        if (data && data.tasks && data.columns) {
          set({
            tasks: data.tasks,
            columns: data.columns
          });
        }
      },

      // Export data (for backup)
      exportData: () => {
        const { tasks, columns } = get();
        return {
          tasks,
          columns,
          exportedAt: new Date().toISOString()
        };
      }
    }),
    {
      name: 'task-storage',
      version: 1,
      // Optional: You can add migration if you change the store structure later
      migrate: (persistedState, version) => {
        if (version === 0) {
          // Migration from version 0 to 1
          return persistedState;
        }
        return persistedState;
      },
    }
  )
);

export default useTaskStore;