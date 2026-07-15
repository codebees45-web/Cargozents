import React, { useState } from 'react';

export default function AgencySupport() {
  const [tickets, setTickets] = useState([
    {
      id: "TKT-8901",
      subject: "GPS tracking lagging on Truck MH-12-QW-9081",
      category: "Technical Issue",
      priority: "High",
      status: "In Progress",
      createdAt: "2026-07-14",
    },
    {
      id: "TKT-7654",
      subject: "Invoicing discrepancy for order #CO-5541",
      category: "Billing",
      priority: "Medium",
      status: "Resolved",
      createdAt: "2026-07-10",
    }
  ]);

  const [formData, setFormData] = useState({
    subject: '',
    category: 'Technical Support',
    priority: 'Low',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.message) return;

    setIsSubmitting(true);

    // Simulate API call delay
    setTimeout(() => {
      const newTicket = {
        id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
        subject: formData.subject,
        category: formData.category,
        priority: formData.priority,
        status: "Open",
        createdAt: new Date().toISOString().split('T')[0]
      };

      setTickets((prev) => [newTicket, ...prev]);
      setIsSubmitting(false);
      setShowSuccessToast(true);

      // Reset form
      setFormData({
        subject: '',
        category: 'Technical Support',
        priority: 'Low',
        message: ''
      });

      // Auto-hide success message after 4 seconds
      setTimeout(() => {
        setShowSuccessToast(false);
      }, 4000);
    }, 1200);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto relative">
      
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#1C4E3A] text-white px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 border border-emerald-500/20 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="w-6 h-6 bg-[#249B74] rounded-full flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold">Ticket Submitted Successfully!</p>
            <p className="text-[10px] text-emerald-200 font-medium mt-0.5">Our support team will review it shortly.</p>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="border-b border-gray-100 pb-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 font-display">Help & Support</h1>
        <p className="text-sm text-gray-500 mt-1">
          Submit support requests, ask questions, or review your ticket history.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Submit Ticket Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#249B74]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a.75.75 0 0 1-1.074-.765 5.99 5.99 0 0 1 1.523-4.238C3.013 14.56 3 13.3 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
            </svg>
            Submit a New Support Ticket
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold tracking-wider text-gray-500 uppercase mb-2">Subject / Issue Title</label>
              <input 
                type="text" 
                name="subject"
                required
                placeholder="e.g. App crashing on driver tracking screen"
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#249B74]/20 focus:border-[#249B74] transition"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold tracking-wider text-gray-500 uppercase mb-2">Category</label>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#249B74]/20 focus:border-[#249B74] transition bg-white"
                >
                  <option value="Technical Support">Technical Support</option>
                  <option value="Billing & Payouts">Billing & Payouts</option>
                  <option value="Driver Management">Driver Management</option>
                  <option value="Vehicle & Fleet Setup">Vehicle & Fleet Setup</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold tracking-wider text-gray-500 uppercase mb-2">Priority Level</label>
                <select 
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#249B74]/20 focus:border-[#249B74] transition bg-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold tracking-wider text-gray-500 uppercase mb-2">Describe the Issue</label>
              <textarea 
                name="message"
                required
                rows="5"
                placeholder="Please describe your issue in detail. If it involves a specific vehicle or order, please provide registration details or order numbers."
                value={formData.message}
                onChange={handleInputChange}
                className="w-full px-4 py-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#249B74]/20 focus:border-[#249B74] transition resize-none"
              />
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 bg-[#249B74] hover:bg-[#1C4E3A] text-white font-bold rounded-lg transition duration-150 text-xs shadow-sm flex items-center justify-center gap-2 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting Ticket...
                </>
              ) : (
                'Submit Ticket'
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Support Context Info / FAQ */}
        <div className="space-y-6">
          <div className="bg-[#1C4E3A]/5 border border-[#1C4E3A]/10 rounded-2xl p-6">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Direct Support Hotline</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Need instant dispatch assistance or have emergency driver issues? Contact operations directly:
            </p>
            <div className="mt-4 space-y-2.5">
              <div className="flex items-center gap-2.5 text-xs text-gray-700 font-semibold">
                <span>📞</span> +91 800-555-CARGO
              </div>
              <div className="flex items-center gap-2.5 text-xs text-gray-700 font-semibold">
                <span>✉️</span> agency-support@cargozents.com
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Operating Hours</h3>
            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Weekdays:</span>
                <span className="font-semibold text-gray-700">24 Hours Open</span>
              </div>
              <div className="flex justify-between">
                <span>Weekends:</span>
                <span className="font-semibold text-gray-700">8:00 AM - 10:00 PM</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Lower Section: Real-time Ticket History Tracker */}
      <div className="mt-10">
        <h2 className="text-base font-bold text-gray-900 mb-4">Your Recent Support Tickets</h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {tickets.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">
              No support tickets opened recently.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-4 px-6">Ticket ID</th>
                    <th className="py-4 px-6">Subject</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Priority</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Created On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs">
                  {tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50/30 transition">
                      <td className="py-4 px-6 font-bold text-gray-900">{t.id}</td>
                      <td className="py-4 px-6 font-semibold text-gray-700">{t.subject}</td>
                      <td className="py-4 px-6 text-gray-500">{t.category}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.priority === 'High' ? 'bg-red-50 text-red-600' :
                          t.priority === 'Medium' ? 'bg-amber-50 text-amber-600' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          t.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          t.status === 'In Progress' ? 'bg-sky-50 text-sky-600 border-sky-100' :
                          'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-400 font-medium">{t.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}