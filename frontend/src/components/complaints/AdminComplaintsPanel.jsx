import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllComplaints, updateComplaint } from '../../services/complaintService';

export default function AdminComplaintsPanel() {
  const { token } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAllComplaints(token)
      .then(setComplaints)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const handleStatusChange = async (id, status) => {
    setComplaints((prev) => prev.map((c) => (c._id === id ? { ...c, status } : c)));
    await updateComplaint(id, { status }, token);
  };

  const handleReplySave = async (id, adminResponse) => {
    await updateComplaint(id, { adminResponse }, token);
    setComplaints((prev) => prev.map((c) => (c._id === id ? { ...c, adminResponse } : c)));
  };

  if (loading) return <p className="text-sm text-slate-500">Loading…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div className="space-y-3">
      {complaints.map((c) => (
        <div key={c._id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-900">{c.subject}</h3>
              <p className="text-xs text-slate-500">
                {c.user?.name} — {c.user?.email}
              </p>
            </div>
            <select
              value={c.status}
              onChange={(e) => handleStatusChange(c._id, e.target.value)}
              className="rounded-md border border-slate-300 px-2 py-1 text-xs"
            >
              <option value="open">Open</option>
              <option value="in_progress">In progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <p className="mt-2 text-sm text-slate-600">{c.description}</p>

          <input
            defaultValue={c.adminResponse}
            placeholder="Write a response…"
            onBlur={(e) => handleReplySave(c._id, e.target.value)}
            className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      ))}
    </div>
  );
}