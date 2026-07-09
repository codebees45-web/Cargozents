import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createComplaint } from '../../services/complaintService';

export default function ComplaintForm({ onCreated }) {
  const { token } = useAuth();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!subject.trim() || !description.trim()) {
      setError('Subject and description are required.');
      return;
    }
    setLoading(true);
    try {
      const created = await createComplaint({ subject, description, order }, token);
      onCreated?.(created);
      setSubject('');
      setDescription('');
      setOrder('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Related order (optional)</label>
        <input
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          placeholder="ORD-4821"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Subject</label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          maxLength={120}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {loading ? 'Submitting…' : 'File complaint'}
      </button>
    </form>
  );
}