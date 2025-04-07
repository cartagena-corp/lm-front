'use client';
import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface UserStory {
   id: string;
   title: string;
   description: string;
   points: number;
   priority: 'low' | 'medium' | 'high';
   status: 'backlog' | 'sprint' | 'in-progress' | 'review' | 'done';
   assignee: string;
}

interface Sprint {
   id: string;
   name: string;
   startDate: string;
   endDate: string;
   stories: UserStory[];
}

const initialSprint: Sprint = {
   id: '1',
   name: 'Sprint 1',
   startDate: '2024-02-20',
   endDate: '2024-03-05',
   stories: [
      {
         id: '1',
         title: 'Implementar autenticación',
         description: 'Configurar NextAuth.js para el login de usuarios',
         points: 5,
         priority: 'high',
         status: 'in-progress',
         assignee: 'Carlos López',
      },
      {
         id: '2',
         title: 'Diseñar dashboard',
         description: 'Crear mockups y componentes del dashboard principal',
         points: 3,
         priority: 'medium',
         status: 'sprint',
         assignee: 'Ana García',
      },
   ],
};

const initialBacklog: UserStory[] = [
   {
      id: '3',
      title: 'Integrar API REST',
      description: 'Conectar el frontend con los endpoints del backend',
      points: 8,
      priority: 'high',
      status: 'backlog',
      assignee: 'María Rodríguez',
   },
   {
      id: '4',
      title: 'Implementar filtros',
      description: 'Agregar funcionalidad de filtrado en las listas',
      points: 3,
      priority: 'low',
      status: 'backlog',
      assignee: 'Juan Pérez',
   },
];

export default function Scrum() {
   const [sprint, setSprint] = useState<Sprint>(initialSprint);
   const [backlog, setBacklog] = useState<UserStory[]>(initialBacklog);

   const getStatusColor = (status: UserStory['status']) => {
      switch (status) {
         case 'backlog':
            return 'bg-gray-50';
         case 'sprint':
            return 'bg-blue-50';
         case 'in-progress':
            return 'bg-yellow-50';
         case 'review':
            return 'bg-purple-50';
         case 'done':
            return 'bg-green-50';
      }
   };

   const getPriorityColor = (priority: UserStory['priority']) => {
      switch (priority) {
         case 'high':
            return 'bg-red-100 text-red-800';
         case 'medium':
            return 'bg-yellow-100 text-yellow-800';
         case 'low':
            return 'bg-green-100 text-green-800';
      }
   };

   const onDragEnd = (result: any) => {
      if (!result.destination) return;
      const { source, destination } = result;

      // Clonación de arrays para evitar mutaciones directas
      const newBacklog = [...backlog];
      const newSprintStories = [...sprint.stories];

      let movedStory: UserStory;
      if (source.droppableId === 'backlog') {
         [movedStory] = newBacklog.splice(source.index, 1);
      } else {
         [movedStory] = newSprintStories.splice(source.index, 1);
      }

      movedStory.status =
         destination.droppableId === 'backlog'
            ? 'backlog'
            : (destination.droppableId as UserStory['status']);

      if (destination.droppableId === 'backlog') {
         newBacklog.splice(destination.index, 0, movedStory);
      } else {
         newSprintStories.splice(destination.index, 0, movedStory);
      }

      if (source.droppableId === 'backlog' || destination.droppableId === 'backlog') {
         setBacklog(newBacklog);
      }
      if (source.droppableId !== 'backlog' || destination.droppableId !== 'backlog') {
         setSprint({ ...sprint, stories: newSprintStories });
      }
   };

   return (
      <div className="bg-white p-4 rounded-md pb-14">
         <div className="flex justify-between items-center mb-4">
            <div className="flex flex-col">
               <h2 className="text-xl font-semibold text-gray-900">{sprint.name}</h2>
               <p className="text-sm text-gray-500">
                  {sprint.startDate} - {sprint.endDate}
               </p>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
               Nuevo Sprint
            </button>
         </div>
         <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-5 gap-4">
               <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Backlog</h3>
                  <div className="h-full">
                     <Droppable droppableId="backlog">
                        {(provided) => (
                           <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className="bg-gray-200 rounded-lg p-4 h-full space-y-4"
                           >
                              {backlog.map((story, index) => (
                                 <Draggable key={story.id} draggableId={story.id} index={index}>
                                    {(provided) => (
                                       <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          className="bg-white p-4 rounded-md shadow-sm"
                                       >
                                          <div {...provided.dragHandleProps} className="cursor-grab">
                                             <h4 className="font-medium text-gray-900">
                                                {story.title}
                                             </h4>
                                          </div>
                                          <p className="text-sm text-gray-600 mt-1">
                                             {story.description}
                                          </p>
                                          <div className="mt-2 flex items-center justify-between">
                                             <span
                                                className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(
                                                   story.priority
                                                )}`}
                                             >
                                                {story.points} pts
                                             </span>
                                             <span className="text-sm text-gray-500">
                                                {story.assignee}
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
               </div>
               {
                  ['sprint', 'in-progress', 'review', 'done'].map((status) => (
                     <div key={status}>
                        <h3 className="font-medium text-gray-900 mb-3 capitalize">
                           {status.replace('-', ' ')}
                        </h3>
                        <div className="h-full">
                           <Droppable droppableId={status}>
                              {(provided) => (
                                 <div ref={provided.innerRef} {...provided.droppableProps}
                                    className={`${getStatusColor(status as UserStory['status'])} rounded-lg p-4 h-full space-y-4`}>
                                    {
                                       sprint.stories.filter((story) => story.status === status).map((story, index) => (
                                          <Draggable key={story.id} draggableId={story.id} index={index}>
                                             {
                                                (provided) => (
                                                   <div
                                                      ref={provided.innerRef}
                                                      {...provided.draggableProps}
                                                      className="bg-white p-4 rounded-md shadow-sm"
                                                   >
                                                      <div {...provided.dragHandleProps} className="cursor-grab">
                                                         <h4 className="font-medium text-gray-900">
                                                            {story.title}
                                                         </h4>
                                                      </div>
                                                      <p className="text-sm text-gray-600 mt-1">
                                                         {story.description}
                                                      </p>
                                                      <div className="mt-2 flex items-center justify-between">
                                                         <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(story.priority)}`}>
                                                            {story.points} pts
                                                         </span>
                                                         <span className="text-sm text-gray-500">
                                                            {story.assignee}
                                                         </span>
                                                      </div>
                                                   </div>

                                                )
                                             }
                                          </Draggable>
                                       ))
                                    }
                                    {provided.placeholder}
                                 </div>
                              )}
                           </Droppable>
                        </div>
                     </div>
                  ))
               }
            </div>
         </DragDropContext>
      </div>
   );
}
