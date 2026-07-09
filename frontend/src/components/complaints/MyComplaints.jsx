import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMyComplaints } from '../../services/complaintService';

const STATUS_STYLES = {
  open: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function MyComplaints() {
  const { token } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyComplaints(token)
      .then(setComplaints)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p className="text-sm text-slate-500">Loading…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (complaints.length === 0)
    return <p className="text-sm text-slate-500">No complaints filed yet.</p>;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {complaints.map((c) => (
        <div key={c._id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-xs text-slate-400">{c._id}</span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[c.status]}`}>
              {c.status.replace('_', ' ')}
            </span>
          </div>
          <h3 className="font-semibold text-slate-900">{c.subject}</h3>
          <p className="mt-1 text-sm text-slate-600">{c.description}</p>
          {c.adminResponse && (
            <p className="mt-2 rounded-md bg-blue-50 p-2 text-xs text-slate-700">
              <span className="font-semibold">Team response: </span>
              {c.adminResponse}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}