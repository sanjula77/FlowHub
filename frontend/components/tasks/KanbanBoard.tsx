'use client';

import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { Task, TaskStatus } from '@/types/task';
import KanbanCard from './KanbanCard';

interface KanbanBoardProps {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  onTaskClick: (task: Task) => void;
}

const columns: { id: TaskStatus; label: string; color: string; dot: string }[] = [
  { id: TaskStatus.TODO, label: 'To Do', color: 'bg-gray-50 border-gray-200', dot: 'bg-gray-400' },
  { id: TaskStatus.IN_PROGRESS, label: 'In Progress', color: 'bg-blue-50 border-blue-200', dot: 'bg-blue-500' },
  { id: TaskStatus.DONE, label: 'Done', color: 'bg-green-50 border-green-200', dot: 'bg-green-500' },
];

export default function KanbanBoard({ tasks, onStatusChange, onTaskClick }: KanbanBoardProps) {
  const tasksByStatus = columns.reduce<Record<TaskStatus, Task[]>>(
    (acc, col) => {
      acc[col.id] = tasks.filter((t) => t.status === col.id);
      return acc;
    },
    { [TaskStatus.TODO]: [], [TaskStatus.IN_PROGRESS]: [], [TaskStatus.DONE]: [] },
  );

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;
    onStatusChange(draggableId, destination.droppableId as TaskStatus);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((col) => {
          const colTasks = tasksByStatus[col.id];
          return (
            <div key={col.id} className={`rounded-xl border ${col.color} flex flex-col min-h-[400px]`}>
              {/* Column header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-inherit">
                <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                <span className="text-sm font-semibold text-gray-700">{col.label}</span>
                <span className="ml-auto text-xs font-medium text-gray-400 bg-white rounded-full px-2 py-0.5 border border-gray-200">
                  {colTasks.length}
                </span>
              </div>

              {/* Droppable area */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 flex flex-col gap-2 p-3 transition-colors duration-150 rounded-b-xl ${
                      snapshot.isDraggingOver ? 'bg-white/60' : ''
                    }`}
                  >
                    {colTasks.map((task, index) => (
                      <KanbanCard
                        key={task.id}
                        task={task}
                        index={index}
                        onClick={onTaskClick}
                      />
                    ))}
                    {provided.placeholder}
                    {colTasks.length === 0 && !snapshot.isDraggingOver && (
                      <div className="flex-1 flex items-center justify-center py-8">
                        <p className="text-xs text-gray-400">No tasks</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
