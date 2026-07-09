import { useState } from 'react';
import ComplaintForm from '../components/complaints/ComplaintForm';
import MyComplaints from '../components/complaints/MyComplaints';

export default function ComplaintsPage() {
  const [tab, setTab] = useState('submit');
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Complaints</h1>

      <div className="mb-6 flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setTab('submit')}
          className={`px-4 py-2 text-sm font-semibold ${tab === 'submit' ? 'border-b-2 border-amber-500 text-slate-900' : 'text-slate-500'}`}
        >
          File a complaint
        </button>
        <button
          onClick={() => setTab('mine')}
          className={`px-4 py-2 text-sm font-semibold ${tab === 'mine' ? 'border-b-2 border-amber-500 text-slate-900' : 'text-slate-500'}`}
        >
          My complaints
        </button>
      </div>

      {tab === 'submit' && (
        <ComplaintForm
          onCreated={() => {
            setRefreshKey((k) => k + 1);
            setTab('mine');
          }}
        />
      )}
      {tab === 'mine' && <MyComplaints key={refreshKey} />}
    </div>
  );
}