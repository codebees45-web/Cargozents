import AdminComplaintsPanel from '../components/complaints/AdminComplaintsPanel';

export default function AdminComplaints() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Manage complaints</h1>
      <AdminComplaintsPanel />
    </div>
  );
}