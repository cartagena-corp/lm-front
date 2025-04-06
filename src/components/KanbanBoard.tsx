import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

const initialColumns: Column[] = [
  {
    id: 'todo',
    title: 'Por hacer',
    tasks: [
      {
        id: '1',
        title: 'Diseñar interfaz',
        description: 'Crear mockups en Figma',
        priority: 'high',
      },
      {
        id: '2',
        title: 'Implementar autenticación',
        description: 'Usar NextAuth.js',
        priority: 'medium',
      },
    ],
  },
  {
    id: 'in-progress',
    title: 'En progreso',
    tasks: [
      {
        id: '3',
        title: 'Desarrollar API',
        description: 'Crear endpoints REST',
        priority: 'high',
      },
    ],
  },
  {
    id: 'done',
    title: 'Completado',
    tasks: [
      {
        id: '4',
        title: 'Configurar proyecto',
        description: 'Instalar dependencias',
        priority: 'low',
      },
    ],
  },
];

export default function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>(initialColumns);

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId === destination.droppableId) {
      const column = columns.find((col) => col.id === source.droppableId);
      if (!column) return;

      const newTasks = Array.from(column.tasks);
      const [removed] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, removed);

      const newColumns = columns.map((col) =>
        col.id === source.droppableId ? { ...col, tasks: newTasks } : col
      );

      setColumns(newColumns);
    } else {
      const sourceColumn = columns.find((col) => col.id === source.droppableId);
      const destColumn = columns.find((col) => col.id === destination.droppableId);
      if (!sourceColumn || !destColumn) return;

      const sourceTasks = Array.from(sourceColumn.tasks);
      const destTasks = Array.from(destColumn.tasks);
      const [removed] = sourceTasks.splice(source.index, 1);
      destTasks.splice(destination.index, 0, removed);

      const newColumns = columns.map((col) => {
        if (col.id === source.droppableId) {
          return { ...col, tasks: sourceTasks };
        }
        if (col.id === destination.droppableId) {
          return { ...col, tasks: destTasks };
        }
        return col;
      });

      setColumns(newColumns);
    }
  };

  return (
    <div className="flex gap-4 p-4 overflow-x-auto">
      <DragDropContext onDragEnd={onDragEnd}>
        {columns.map((column) => (
          <div
            key={column.id}
            className="flex-shrink-0 w-80 bg-gray-100 rounded-lg p-4"
          >
            <h3 className="font-semibold text-gray-700 mb-4">{column.title}</h3>
            <Droppable droppableId={column.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-3"
                >
                  {column.tasks.map((task, index) => (
                    <Draggable
                      key={task.id}
                      draggableId={task.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white p-4 rounded-md shadow-sm"
                        >
                          <h4 className="font-medium text-gray-900">
                            {task.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {task.description}
                          </p>
                          <div className="mt-2">
                            <span
                              className={`inline-block px-2 py-1 text-xs rounded ${
                                task.priority === 'high'
                                  ? 'bg-red-100 text-red-800'
                                  : task.priority === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {task.priority}
                            </span>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </DragDropContext>
    </div>
  );
} 