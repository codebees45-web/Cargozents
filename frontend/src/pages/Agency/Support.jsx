import React, { useState } from 'react';

export default function AgencySupport() {
  const [form, setForm] = useState({
    subject: '',
    category: 'General Inquiry',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API ticket submission
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      setForm({ subject: '', category: 'General Inquiry', message: '' });
    }, 1200);
  };

  return (
    <div className="p-6 max-w-4xl pb-10 relative">
      
      {/* 🟢 CLEAN INTERIOR VIEW HEADING BLOCK */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#133C2C]">Support Help Desk</h1>
        <p className="text-sm text-gray-500">Get assistance with your fleet loads, tracking updates, or account issues.</p>
      </div>

      {showSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-semibold text-center animate-in fade-in duration-200">
          ✅ Support ticket submitted successfully! Our team will respond shortly.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Contact Form Card */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6 md:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-[#133C2C] mb-6">Create a Support Ticket</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[13px] font-semibold text-[#133C2C] mb-2">Subject</label>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                required
                placeholder="Brief summary of the issue"
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#249B74]/20 focus:border-[#249B74] transition bg-white"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#133C2C] mb-2">Category</label>
              <div className="relative">
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full appearance-none px-4 py-2.5 text-sm rounded-lg border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#249B74]/20 focus:border-[#249B74] transition bg-white"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Fleet Tracking">Fleet Tracking Issues</option>
                  <option value="Payments">Payments & Billing</option>
                  <option value="App Bug">Report a Bug</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#133C2C] mb-2">Message / Details</label>
              <textarea
                name="message"
                rows="5"
                value={form.message}
                onChange={handleChange}
                required
                placeholder="Describe your problem in detail..."
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#249B74]/20 focus:border-[#249B74] transition bg-white resize-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-8 py-3 bg-[#1C4E3A] hover:bg-[#133C2C] text-white text-sm font-bold rounded-lg transition-all shadow-sm flex items-center gap-2 ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </div>
          </form>
        </div>

        {/* Info Sidebar Cards */}
        <div className="space-y-6">
          <div className="bg-[#FAFDFB] rounded-xl border border-emerald-100/50 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#133C2C] uppercase tracking-wider mb-3">Direct Contact</h3>
            <p className="text-xs text-gray-600 mb-4">Need urgent operational tracking support regarding an active vehicle dispatch?</p>
            <div className="text-sm font-semibold text-[#1C4E3A] space-y-1">
              <div>📞 +91 99401 79070</div>
              <div>✉️ support@cargozents.com</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#133C2C] uppercase tracking-wider mb-3">Response Time</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Standard operational tickets are assigned within <span className="font-semibold text-gray-700">15-30 minutes</span>. Urgent backhaul assignment updates are handled live via line dispatch.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}