'use client';

import { useEffect, useState, useCallback } from 'react';
import { Task, TaskStatus } from '@/types/task';
import { Comment } from '@/types/comment';
import { Label } from '@/types/label';
import { User } from '@/types/user';
import {
  getTaskComments,
  createComment,
  deleteComment,
  updateTask,
  getTeamLabels,
  addTaskLabel,
  removeTaskLabel,
} from '@/lib/api';
import { X, Send, Trash2, Tag } from 'lucide-react';
import Badge from '@/components/ui/Badge';

interface TaskDetailModalProps {
  task: Task;
  currentUser: User;
  onClose: () => void;
  onTaskUpdated: (updated: Task) => void;
}

const statusConfig = {
  [TaskStatus.TODO]: { label: 'To Do', variant: 'gray' as const },
  [TaskStatus.IN_PROGRESS]: { label: 'In Progress', variant: 'primary' as const },
  [TaskStatus.DONE]: { label: 'Done', variant: 'success' as const },
};

export default function TaskDetailModal({ task, currentUser, onClose, onTaskUpdated }: TaskDetailModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [teamLabels, setTeamLabels] = useState<Label[]>([]);
  const [taskLabels, setTaskLabels] = useState<{ id: string; name: string; color: string }[]>(task.labels ?? []);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(true);
  const [postingComment, setPostingComment] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [status, setStatus] = useState(task.status);
  const [savingField, setSavingField] = useState<string | null>(null);
  const [error, setError] = useState('');

  const loadComments = useCallback(async () => {
    try {
      setLoadingComments(true);
      const data = await getTaskComments(task.id);
      setComments(data);
    } catch {
      setError('Failed to load comments');
    } finally {
      setLoadingComments(false);
    }
  }, [task.id]);

  const loadTeamLabels = useCallback(async () => {
    try {
      const data = await getTeamLabels(task.teamId);
      setTeamLabels(data);
    } catch {
      // silently ignore
    }
  }, [task.teamId]);

  useEffect(() => {
    loadComments();
    loadTeamLabels();
  }, [loadComments, loadTeamLabels]);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setPostingComment(true);
    try {
      const comment = await createComment(task.id, newComment.trim());
      setComments((prev) => [...prev, comment]);
      setNewComment('');
    } catch (err: any) {
      setError(err.message || 'Failed to post comment');
    } finally {
      setPostingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete comment');
    }
  };

  const handleSaveTitle = async () => {
    if (!title.trim() || title === task.title) { setEditingTitle(false); return; }
    setSavingField('title');
    try {
      const updated = await updateTask(task.id, { title: title.trim() });
      onTaskUpdated(updated);
    } catch (err: any) {
      setError(err.message);
      setTitle(task.title);
    } finally {
      setSavingField(null);
      setEditingTitle(false);
    }
  };

  const handleSaveDescription = async () => {
    if (description === (task.description ?? '')) return;
    setSavingField('description');
    try {
      const updated = await updateTask(task.id, { description });
      onTaskUpdated(updated);
    } catch (err: any) {
      setError(err.message);
      setDescription(task.description ?? '');
    } finally {
      setSavingField(null);
    }
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (newStatus === status) return;
    setStatus(newStatus);
    try {
      const updated = await updateTask(task.id, { status: newStatus });
      onTaskUpdated(updated);
    } catch (err: any) {
      setError(err.message);
      setStatus(task.status);
    }
  };

  const handleToggleLabel = async (label: Label) => {
    const attached = taskLabels.some((l) => l.id === label.id);
    if (attached) {
      try {
        await removeTaskLabel(task.id, label.id);
        const newLabels = taskLabels.filter((l) => l.id !== label.id);
        setTaskLabels(newLabels);
        onTaskUpdated({ ...task, labels: newLabels });
      } catch (err: any) {
        setError(err.message);
      }
    } else {
      try {
        await addTaskLabel(task.id, label.id);
        const newLabels = [...taskLabels, { id: label.id, name: label.name, color: label.color }];
        setTaskLabels(newLabels);
        onTaskUpdated({ ...task, labels: newLabels });
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const isAdmin = currentUser.role === 'ADMIN';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-start gap-3 p-6 border-b border-gray-200">
            <div className="flex-1 min-w-0">
              {editingTitle ? (
                <input
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveTitle(); if (e.key === 'Escape') { setTitle(task.title); setEditingTitle(false); } }}
                  className="w-full text-xl font-semibold text-gray-900 border-b-2 border-blue-500 outline-none bg-transparent"
                  disabled={savingField === 'title'}
                />
              ) : (
                <h2
                  className="text-xl font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => setEditingTitle(true)}
                  title="Click to edit"
                >
                  {title}
                </h2>
              )}
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Status + Labels row */}
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  {Object.entries(statusConfig).map(([val, cfg]) => (
                    <option key={val} value={val}>{cfg.label}</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <label className="block text-xs font-medium text-gray-500 mb-1">Labels</label>
                <div className="flex flex-wrap items-center gap-1">
                  {taskLabels.map((label) => (
                    <span
                      key={label.id}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white"
                      style={{ backgroundColor: label.color }}
                    >
                      {label.name}
                    </span>
                  ))}
                  <button
                    onClick={() => setShowLabelPicker(!showLabelPicker)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs text-gray-500 border border-dashed border-gray-300 hover:border-gray-400 hover:text-gray-700 transition-colors"
                  >
                    <Tag className="w-3 h-3" />
                    {taskLabels.length === 0 ? 'Add label' : 'Edit'}
                  </button>
                </div>

                {showLabelPicker && teamLabels.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 z-10 bg-white rounded-lg border border-gray-200 shadow-lg p-2 min-w-[160px]">
                    {teamLabels.map((label) => {
                      const isAttached = taskLabels.some((l) => l.id === label.id);
                      return (
                        <button
                          key={label.id}
                          onClick={() => handleToggleLabel(label)}
                          className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-gray-50 text-left text-sm"
                        >
                          <span
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: label.color }}
                          />
                          <span className="flex-1 text-gray-700">{label.name}</span>
                          {isAttached && <span className="text-blue-500 text-xs">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleSaveDescription}
                rows={3}
                placeholder="Add a description..."
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-colors"
                disabled={savingField === 'description'}
              />
              {savingField === 'description' && (
                <p className="text-xs text-gray-400 mt-1">Saving...</p>
              )}
            </div>

            {/* Comments */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Comments</h3>

              {loadingComments ? (
                <p className="text-sm text-gray-400">Loading comments...</p>
              ) : comments.length === 0 ? (
                <p className="text-sm text-gray-400">No comments yet.</p>
              ) : (
                <div className="space-y-3 mb-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 group">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-blue-600">
                        {(comment.userId ?? '??').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm text-gray-800 break-words">{comment.content}</p>
                          {(isAdmin || comment.userId === currentUser.id) && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all flex-shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(comment.createdAt).toLocaleString('en-US', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Comment input */}
              <div className="flex gap-2">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handlePostComment();
                    }
                  }}
                  placeholder="Write a comment... (Enter to post)"
                  rows={2}
                  className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  disabled={postingComment}
                />
                <button
                  onClick={handlePostComment}
                  disabled={!newComment.trim() || postingComment}
                  className="self-end px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
