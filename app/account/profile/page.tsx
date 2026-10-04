'use client';

import React, { useState, useEffect } from 'react';

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    altPhone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    // Load from local storage for persistence across customer checkout & profile visits
    const saved = localStorage.getItem('undrskin_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({
          ...prev,
          ...parsed,
          addressLine1: parsed.addressLine1 || parsed.address || '',
        }));
      } catch (e) {
        console.error('Error loading profile:', e);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');

    try {
      localStorage.setItem('undrskin_profile', JSON.stringify(formData));
      setIsSaved(true);
      setSaveMessage('Profile and shipping details saved successfully.');
      setTimeout(() => {
        setIsSaved(false);
      }, 4000);
    } catch {
      setSaveMessage('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-[75vh] bg-[#A6C7B7] text-[#302824] py-12 sm:py-20 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto bg-[#F1E9DF] p-8 sm:p-12 rounded-2xl shadow-xl border border-[#302824]/15">
        <div className="mb-8 pb-6 border-b border-[#302824]/15">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#302824]/60 font-mono block mb-2">
            Client Profile &amp; Address
          </span>
          <h1 className="text-2xl sm:text-3xl font-light text-[#302824] tracking-[0.15em] uppercase">
            Shipping &amp; Account Details
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#302824]/75 font-light">
            Configure your primary contact information and delivery address for accelerated express checkout.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-[#302824] font-medium">Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-[#302824]/70">Full Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Aditi Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white border border-[#302824]/20 text-sm px-4 py-3 text-[#302824] rounded-xl focus:outline-none focus:border-[#7E1626]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-[#302824]/70">Primary Phone *</label>
                <input
                  required
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-white border border-[#302824]/20 text-sm px-4 py-3 text-[#302824] rounded-xl focus:outline-none focus:border-[#7E1626]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-[#302824]/70">Alternative Phone (Optional)</label>
                <input
                  type="tel"
                  placeholder="+91 91234 56789"
                  value={formData.altPhone}
                  onChange={(e) => setFormData({ ...formData, altPhone: e.target.value })}
                  className="w-full bg-white border border-[#302824]/20 text-sm px-4 py-3 text-[#302824] rounded-xl focus:outline-none focus:border-[#7E1626]"
                />
              </div>
            </div>
          </div>

          {/* Address Info */}
          <div className="space-y-4 pt-4 border-t border-[#302824]/15">
            <h3 className="text-xs uppercase tracking-widest text-[#302824] font-medium">Delivery Address</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-[#302824]/70">Address Line 1 *</label>
                <input
                  required
                  type="text"
                  placeholder="Flat / House No., Building Name, Street"
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  className="w-full bg-white border border-[#302824]/20 text-sm px-4 py-3 text-[#302824] rounded-xl focus:outline-none focus:border-[#7E1626]"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-[#302824]/70">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  placeholder="Locality, Landmark, Area"
                  value={formData.addressLine2}
                  onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                  className="w-full bg-white border border-[#302824]/20 text-sm px-4 py-3 text-[#302824] rounded-xl focus:outline-none focus:border-[#7E1626]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-[#302824]/70">City *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Mumbai"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-white border border-[#302824]/20 text-sm px-4 py-3 text-[#302824] rounded-xl focus:outline-none focus:border-[#7E1626]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-[#302824]/70">State *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Maharashtra"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full bg-white border border-[#302824]/20 text-sm px-4 py-3 text-[#302824] rounded-xl focus:outline-none focus:border-[#7E1626]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-[#302824]/70">PIN Code *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. 400001"
                  maxLength={6}
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full bg-white border border-[#302824]/20 text-sm px-4 py-3 text-[#302824] font-mono rounded-xl focus:outline-none focus:border-[#7E1626]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-[#302824]/70">Country *</label>
                <input
                  required
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full bg-white border border-[#302824]/20 text-sm px-4 py-3 text-[#302824] rounded-xl focus:outline-none focus:border-[#7E1626]"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#302824] text-[#F1E9DF] hover:bg-[#7E1626] transition-colors text-xs uppercase tracking-widest font-medium rounded-xl disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : isSaved ? 'Details Saved ✓' : 'Save Profile'}
            </button>
            {saveMessage && (
              <span className={`text-xs font-medium ${isSaved ? 'text-emerald-700' : 'text-[#302824]/70'}`}>
                {saveMessage}
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
