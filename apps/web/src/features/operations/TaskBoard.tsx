import { useState } from 'react';
import { PageHeader, Card, Badge, Button, Modal, Input, Select, EmptyState, LoadingSpinner } from '@/components/ui';
import { useTasks, useCreateTask, useUpdateTaskStatus } from '@/api/operations';
import { useAuthStore } from '@/stores/auth';
import { formatDate, cn } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { TaskStatus, TaskPriority } from '@nuestable/shared';
import type { Task } from '@nuestable/shared';
import { PlusIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';

const COLUMNS: { key: TaskStatus; label: string; color: string }[] = [
  { key: TaskStatus.PENDING, label: 'Pending', color: 'bg-gray-400' },
  { key: TaskStatus.IN_PROGRESS, label: 'In Progress', color: 'bg-blue-400' },
  { key: TaskStatus.COMPLETED, label: 'Completed', color: 'bg-green-400' },
];

const priorityColors: Record<string, string> = {
  LOW: 'border-l-gray-300',
  MEDIUM: 'border-l-blue-400',
  HIGH: 'border-l-yellow-400',
  URGENT: 'border-l-red-500',
};

export default function TaskBoard() {
  const { user } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading } = useTasks({ limit: 100 });
  const createMutation = useCreateTask();
  const updateStatusMutation = useUpdateTaskStatus();

  const tasks = data?.data ?? [];

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { title: '', description: '', priority: TaskPriority.MEDIUM as string, dueAt: '' },
  });

  const onSubmit = (formData: Record<string, string>) => {
    createMutation.mutate(
      {
        organizationId: user?.organizationId ?? '',
        title: formData.title ?? '',
        description: formData.description || undefined,
        priority: (formData.priority as TaskPriority) || TaskPriority.MEDIUM,
        dueAt: formData.dueAt || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Task created');
          reset();
          setShowForm(false);
        },
      },
    );
  };

  const moveTask = (taskId: string, newStatus: TaskStatus) => {
    updateStatusMutation.mutate({ id: taskId, status: newStatus });
  };

  const priorityOptions = Object.values(TaskPriority).map((p) => ({ label: p, value: p }));

  return (
    <div>
      <PageHeader
        title="Task Board"
        breadcrumbs={[
          { label: 'Operations', href: '/operations/checklist' },
          { label: 'Tasks' },
        ]}
        actions={
          <Button icon={<PlusIcon className="h-4 w-4" />} onClick={() => setShowForm(true)}>
            New Task
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.key);

            return (
              <div key={col.key}>
                <div className="mb-3 flex items-center gap-2">
                  <span className={cn('h-3 w-3 rounded-full', col.color)} />
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {col.label}
                  </h3>
                  <Badge color="gray" size="sm">{colTasks.length}</Badge>
                </div>

                <div className="space-y-3 min-h-[200px] rounded-lg bg-gray-50 p-3 dark:bg-gray-800/30">
                  {colTasks.length === 0 ? (
                    <p className="text-center text-xs text-gray-400 py-8">No tasks</p>
                  ) : (
                    colTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onMove={moveTask}
                        columns={COLUMNS}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="New Task">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Title" {...register('title', { required: true })} />
          <Input label="Description" {...register('description')} />
          <Select label="Priority" options={priorityOptions} {...register('priority')} />
          <Input label="Due Date" type="datetime-local" {...register('dueAt')} />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" loading={createMutation.isPending}>Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function TaskCard({
  task,
  onMove,
  columns,
}: {
  task: Task;
  onMove: (id: string, status: TaskStatus) => void;
  columns: typeof COLUMNS;
}) {
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800 border-l-4',
        priorityColors[task.priority] ?? 'border-l-gray-300',
      )}
    >
      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{task.title}</p>
      {task.description && (
        <p className="mt-1 text-xs text-gray-500 line-clamp-2">{task.description}</p>
      )}
      <div className="mt-2 flex items-center justify-between">
        <Badge
          color={task.priority === 'URGENT' ? 'red' : task.priority === 'HIGH' ? 'yellow' : 'gray'}
          size="sm"
        >
          {task.priority}
        </Badge>
        {task.dueAt && (
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <ClockIcon className="h-3 w-3" />
            {formatDate(task.dueAt, 'MMM D')}
          </span>
        )}
      </div>
      {/* Quick move buttons */}
      <div className="mt-2 flex gap-1">
        {columns
          .filter((c) => c.key !== task.status)
          .map((c) => (
            <button
              key={c.key}
              onClick={() => onMove(task.id, c.key)}
              className="rounded px-2 py-1 text-[10px] font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Move to {c.label}
            </button>
          ))}
      </div>
    </div>
  );
}
