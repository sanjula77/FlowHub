'use client';

import { Draggable } from '@hello-pangea/dnd';
import { Task, TaskStatus } from '@/types/task';
import { Calendar } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { useMemo } from 'react';

interface KanbanCardProps {
  task: Task;
  index: number;
  onClick: (task: Task) => void;
}

const priorityConfig: Record<number, { label: string; variant: 'error' | 'warning' | 'info' | 'gray' }> = {
  1: { label: 'P1', variant: 'error' },
  2: { label: 'P2', variant: 'warning' },
  3: { label: 'P3', variant: 'info' },
};

export default function KanbanCard({ task, index, onClick }: KanbanCardProps) {
  const formattedDueDate = useMemo(() => {
    if (!task.dueDate) return null;
    try {
      return new Date(task.dueDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return null;
    }
  }, [task.dueDate]);

  const isOverdue = useMemo(() => {
    if (!task.dueDate || task.status === TaskStatus.DONE) return false;
    return new Date(task.dueDate) < new Date();
  }, [task.dueDate, task.status]);

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          className={`
            bg-white rounded-lg border p-3 cursor-pointer select-none
            transition-shadow duration-150
            ${snapshot.isDragging
              ? 'shadow-lg border-blue-300 rotate-1'
              : 'shadow-sm border-gray-200 hover:shadow-md hover:border-gray-300'
            }
          `}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="text-sm font-medium text-gray-900 leading-snug line-clamp-2 flex-1">
              {task.title}
            </p>
            {task.priority && priorityConfig[task.priority] && (
              <Badge variant={priorityConfig[task.priority].variant} size="sm">
                {priorityConfig[task.priority].label}
              </Badge>
            )}
          </div>

          {task.labels && task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {task.labels.map((label) => (
                <span
                  key={label.id}
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium text-white"
                  style={{ backgroundColor: label.color }}
                >
                  {label.name}
                </span>
              ))}
            </div>
          )}

          {formattedDueDate && (
            <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
              <Calendar className="w-3 h-3" />
              <span>{formattedDueDate}</span>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}
