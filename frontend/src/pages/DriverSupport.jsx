import React, { useState } from 'react';
import DashboardLayout from '../components/common/DashboardLayout';

export default function DriverSupport() {
  const [formData, setFormData] = useState({ subject: '', category: 'Active Trip Emergency', priority: 'High', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowToast(true);
      setFormData({ subject: '', category: 'Active Trip Emergency', priority: 'High', message: '' });
      setTimeout(() => setShowToast(false), 4000);
    }, 1200);
  };

  return (
    <DashboardLayout title="Driver Support" subtitle="Get help with active trips, payments, or report an issue.">
      <div className="max-w-4xl pb-10 relative">
        {showToast && (
          <div className="fixed bottom-10 right-10 z-50 bg-primary text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3">
            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
            <p className="text-sm font-bold">Support Request Sent!</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-secondary/10 rounded-xl border border-primary/10 p-8 shadow-sm">
            <h2 className="text-lg font-bold text-primary mb-6">Submit a Ticket</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold tracking-wider text-[#5B7A70] uppercase mb-2">Subject</label>
                <input type="text" name="subject" required value={formData.subject} onChange={handleInputChange} className="w-full px-4 py-2.5 text-sm rounded-lg border border-primary/10 focus:outline-none focus:border-accent bg-background text-primary" placeholder="e.g. Tire blowout on NH-44" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold tracking-wider text-[#5B7A70] uppercase mb-2">Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-4 py-2.5 text-sm rounded-lg border border-primary/10 focus:outline-none focus:border-accent bg-background text-primary">
                    <option value="Active Trip Emergency">Active Trip Emergency</option>
                    <option value="Payment & Wallet Issue">Payment & Wallet Issue</option>
                    <option value="App/Technical Issue">App/Technical Issue</option>
                    <option value="Document Verification">Document Verification</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-wider text-[#5B7A70] uppercase mb-2">Priority</label>
                  <select name="priority" value={formData.priority} onChange={handleInputChange} className="w-full px-4 py-2.5 text-sm rounded-lg border border-primary/10 focus:outline-none focus:border-accent bg-background text-primary">
                    <option value="High">High (Urgent)</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold tracking-wider text-[#5B7A70] uppercase mb-2">Message</label>
                <textarea name="message" required rows="4" value={formData.message} onChange={handleInputChange} className="w-full px-4 py-3 text-sm rounded-lg border border-primary/10 focus:outline-none focus:border-accent bg-background text-primary resize-none" placeholder="Provide details, order IDs, or vehicle location..." />
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-primary hover:bg-primary/95 text-secondary font-bold rounded-lg transition-all text-sm shadow-sm">
                {isSubmitting ? 'Sending...' : 'Submit to Dispatch'}
              </button>
            </form>
          </div>

          {/* Emergency Contact Block */}
          <div className="bg-accent/10 border border-accent/20 rounded-xl p-6 h-fit">
            <h3 className="font-bold text-primary text-sm mb-3">24/7 Dispatch Hotline</h3>
            <p className="text-xs text-[#5B7A70] leading-relaxed mb-4">
              For emergencies on an active load or immediate breakdown assistance, call operations directly.
            </p>
            <a href="tel:+918005550000" className="flex items-center justify-center w-full py-2.5 bg-primary text-secondary text-xs font-bold rounded-lg shadow-sm">
              📞 +91 800-555-0000
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}