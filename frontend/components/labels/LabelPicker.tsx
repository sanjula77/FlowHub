'use client';

import { useState } from 'react';
import { Label } from '@/types/label';
import { createLabel, deleteLabel } from '@/lib/api';
import { Plus, Trash2, X } from 'lucide-react';

interface LabelPickerProps {
  teamId: string;
  labels: Label[];
  onLabelsChanged: (labels: Label[]) => void;
  canManage: boolean;
}

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
  '#6b7280', '#1e293b',
];

export default function LabelPicker({ teamId, labels, onLabelsChanged, canManage }: LabelPickerProps) {
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    setError('');
    try {
      const label = await createLabel(teamId, newName.trim(), newColor);
      onLabelsChanged([...labels, label]);
      setNewName('');
      setNewColor(PRESET_COLORS[0]);
      setShowForm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create label');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this label? It will be removed from all tasks.')) return;
    try {
      await deleteLabel(id);
      onLabelsChanged(labels.filter((l) => l.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete label');
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center justify-between">
          {error}
          <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Existing labels */}
      <div className="flex flex-wrap gap-2">
        {labels.length === 0 && (
          <p className="text-sm text-gray-400">No labels yet.</p>
        )}
        {labels.map((label) => (
          <div
            key={label.id}
            className="group flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm text-white"
            style={{ backgroundColor: label.color }}
          >
            <span>{label.name}</span>
            {canManage && (
              <button
                onClick={() => handleDelete(label.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                title="Delete label"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Create form */}
      {canManage && (
        <>
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <Plus className="w-4 h-4" />
              Create label
            </button>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <input
                autoFocus
                type="text"
                maxLength={50}
                placeholder="Label name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setShowForm(false); }}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-40"
              />
              <div className="flex items-center gap-1">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewColor(color)}
                    className={`w-5 h-5 rounded-full border-2 transition-transform ${newColor === color ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <button
                onClick={handleCreate}
                disabled={saving || !newName.trim()}
                className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving...' : 'Add'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
