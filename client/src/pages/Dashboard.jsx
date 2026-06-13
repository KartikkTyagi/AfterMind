import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useEstate from '../hooks/useEstate';
import CompletionMeter from '../components/dashboard/CompletionMeter';
import EstateSection from '../components/dashboard/EstateSection';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { MessageSquare, Download, Users, Plus, ShieldCheck, HelpCircle } from 'lucide-react';

export default function Dashboard() {
  const { 
    estateProfile, 
    accounts, 
    documents, 
    assets, 
    contacts, 
    capsules, 
    loading,
    addAccount,
    addDocument,
    addAsset,
    addContact,
    addCapsule,
    removeAccount,
    removeDocument,
    removeAsset,
    removeContact,
    removeCapsule
  } = useEstate();

  const handleDownloadReport = () => {
    const token = localStorage.getItem('aftermind_token');
    if (estateProfile?.id) {
      window.open(`http://localhost:3001/api/reports/generate/${estateProfile.id}?token=${token}`, '_blank');
    }
  };

  // Modal control states
  const [activeModal, setActiveModal] = useState(null); // 'account' | 'document' | 'asset' | 'contact' | 'capsule'

  // Input states for creators
  const [accountForm, setAccountForm] = useState({ platform: '', account_email: '', action: 'delete', notes: '' });
  const [docForm, setDocForm] = useState({ document_type: 'will', document_name: '', location_description: '' });
  const [assetForm, setAssetForm] = useState({ asset_type: 'bank', institution: '', description: '', designated_recipient: '', notes: '' });
  const [contactForm, setContactForm] = useState({ full_name: '', relationship: '', email: '', phone: '', role: 'family' });

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const resetForms = () => {
    setAccountForm({ platform: '', account_email: '', action: 'delete', notes: '' });
    setDocForm({ document_type: 'will', document_name: '', location_description: '' });
    setAssetForm({ asset_type: 'bank', institution: '', description: '', designated_recipient: '', notes: '' });
    setContactForm({ full_name: '', relationship: '', email: '', phone: '', role: 'family' });
    setFormError(null);
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await addAccount(accountForm);
      setActiveModal(null);
      resetForms();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddDoc = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await addDocument(docForm);
      setActiveModal(null);
      resetForms();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddAsset = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await addAsset(assetForm);
      setActiveModal(null);
      resetForms();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await addContact(contactForm);
      setActiveModal(null);
      resetForms();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading && !estateProfile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-transparent text-[#E8D5B7] font-sans">
        <svg className="animate-spin h-8 w-8 text-[#D4A853] mb-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span>Securing estate records...</span>
      </div>
    );
  }

  // Calculate Breakdown states
  const breakdown = {
    accounts: accounts.length > 0,
    documents: documents.length > 0,
    assets: assets.length > 0,
    contacts: contacts.length > 0,
    capsules: capsules.length > 0
  };

  return (
    <div className="flex-1 bg-transparent p-6 md:p-12 space-y-8 max-w-7xl mx-auto w-full page-entrance">
      {/* Welcome banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#D4A853]/20 pb-6">
        <div>
          <h1 className="font-display text-4xl md:text-[56px] font-bold text-white leading-tight">
            Your Digital Estate Profile
          </h1>
          <p className="font-sans text-sm text-[#F5E6C8]/80 font-light mt-0.5">
            Prepared by {estateProfile?.full_name || 'AfterMind User'}
          </p>
        </div>

        {/* Quick Actions Header */}
        <div className="flex items-center gap-3 flex-wrap font-sans">
          <Link to="/setup">
            <Button className="btn-primary-premium flex items-center gap-1.5 py-2.5 px-5 text-xs rounded-xl">
              <MessageSquare size={14} />
              <span>Continue Setup Chat</span>
            </Button>
          </Link>
          <Link to="/capsules">
            <Button variant="secondary" className="btn-secondary-premium py-2.5 px-5 text-xs rounded-xl">
              Seal Time Capsule
            </Button>
          </Link>
        </div>
      </div>

      {/* Completion Meter */}
      <CompletionMeter 
        percentage={estateProfile?.completion_percentage || 0} 
        breakdown={breakdown} 
      />

      {/* Estate Panels */}
      <div className="grid grid-cols-1 gap-8">
        {/* Digital Accounts */}
        <EstateSection
          title="Digital Accounts & Subscriptions"
          description="Subscriptions, streaming services, emails, and wishes for account decommissioning."
          type="accounts"
          items={accounts}
          onAddClick={() => setActiveModal('account')}
          onDeleteClick={removeAccount}
        />

        {/* Important Documents */}
        <EstateSection
          title="Important Document Locations"
          description="Physical and digital registry for wills, insurances, titles, and passports."
          type="documents"
          items={documents}
          onAddClick={() => setActiveModal('document')}
          onDeleteClick={removeDocument}
        />

        {/* Financial Assets */}
        <EstateSection
          title="Financial Assets & Portfolios"
          description="Banks, stock portfolios, and designations for your primary beneficiaries."
          type="assets"
          items={assets}
          onAddClick={() => setActiveModal('asset')}
          onDeleteClick={removeAsset}
        />

        {/* Trusted Contacts */}
        <EstateSection
          title="Trusted Contacts & Executors"
          description="The family members and friends designated to manage your digital affairs."
          type="contacts"
          items={contacts}
          onAddClick={() => setActiveModal('contact')}
          onDeleteClick={removeContact}
        />
      </div>

      {/* Bottom Action Footer Bar */}
      <div className="bg-[#0F0C08]/90 border border-red-950/40 hover:border-red-900/40 rounded-xl p-6 shadow-premium flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden before:absolute before:inset-0 before:bg-red-500/5 before:pointer-events-none before:z-0">
        <div className="flex items-center gap-4 relative z-10">
          <div className="bg-red-500/10 p-3 rounded-full text-red-400 border border-red-500/25 animate-pulse flex-shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h4 className="font-display text-base font-bold text-red-400">Simulate Activation Protocol</h4>
            <p className="font-sans text-xs text-[#E8D5B7] mt-0.5 max-w-md">
              Testing this flow is vital. Verify how AfterMind's automated delivery checklist and vault operate for your trusted executors.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto relative z-10 font-sans">
          {/* Report Button Enabled */}
          <Button
            onClick={handleDownloadReport}
            className="w-full sm:w-auto btn-primary-premium py-2.5 px-5 rounded-lg flex items-center justify-center gap-1.5"
          >
            <Download size={14} />
            <span>Download Estate Report</span>
          </Button>

          <Link to="/family-portal" className="w-full sm:w-auto">
            <Button 
              variant="secondary" 
              className="w-full justify-center text-xs font-bold py-2.5 px-5 btn-secondary-premium rounded-lg"
            >
              Preview Family Portal
            </Button>
          </Link>
        </div>
      </div>

      {/* =========================================================================
         MANUAL CREATORS MODALS
         ========================================================================= */}

      {/* Account Modal */}
      <Modal isOpen={activeModal === 'account'} onClose={() => setActiveModal(null)} title="Add Digital Account">
        {formError && <div className="bg-red-950 border border-red-800 text-red-200 text-xs p-2.5 rounded mb-3">{formError}</div>}
        <form onSubmit={handleAddAccount} className="space-y-4 font-sans text-xs">
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-[#E8D5B7]">Platform Name</label>
            <input 
              type="text" 
              required
              value={accountForm.platform}
              onChange={(e) => setAccountForm(prev => ({ ...prev, platform: e.target.value }))}
              placeholder="e.g. Netflix, Gmail, Spotify"
              className="py-2 px-3 rounded-md text-xs"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-[#E8D5B7]">Account Email / Username</label>
            <input 
              type="text" 
              value={accountForm.account_email}
              onChange={(e) => setAccountForm(prev => ({ ...prev, account_email: e.target.value }))}
              placeholder="e.g. myaccount@gmail.com"
              className="py-2 px-3 rounded-md text-xs"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-[#E8D5B7]">Wished Action</label>
            <select 
              value={accountForm.action}
              onChange={(e) => setAccountForm(prev => ({ ...prev, action: e.target.value }))}
              className="py-2 px-3 rounded-md text-xs w-full"
            >
              <option value="delete">Delete Account</option>
              <option value="cancel">Cancel Subscription</option>
              <option value="transfer">Transfer Ownership</option>
              <option value="memorialize">Memorialize Account</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-[#E8D5B7]">Additional Notes / Instructions</label>
            <textarea 
              value={accountForm.notes}
              onChange={(e) => setAccountForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="e.g. Please cancel credit card billing immediately."
              rows={3}
              className="py-2 px-3 rounded-md text-xs"
            />
          </div>
          <Button type="submit" loading={saving} className="w-full justify-center py-2.5 text-xs btn-primary-premium rounded-lg">
            Save Digital Account
          </Button>
        </form>
      </Modal>

      {/* Document Modal */}
      <Modal isOpen={activeModal === 'document'} onClose={() => setActiveModal(null)} title="Add Document Location">
        {formError && <div className="bg-red-950 border border-red-800 text-red-200 text-xs p-2.5 rounded mb-3">{formError}</div>}
        <form onSubmit={handleAddDoc} className="space-y-4 font-sans text-xs">
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-[#E8D5B7]">Document Category</label>
            <select 
              value={docForm.document_type}
              onChange={(e) => setDocForm(prev => ({ ...prev, document_type: e.target.value }))}
              className="py-2 px-3 rounded-md text-xs w-full"
            >
              <option value="will">Will & Testament</option>
              <option value="insurance">Insurance Policy</option>
              <option value="property">Property Deeds / Deeds</option>
              <option value="bank">Bank Records</option>
              <option value="other">Other Crucial Paper</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-[#E8D5B7]">Document Name</label>
            <input 
              type="text" 
              required
              value={docForm.document_name}
              onChange={(e) => setDocForm(prev => ({ ...prev, document_name: e.target.value }))}
              placeholder="e.g. Life Insurance Contract"
              className="py-2 px-3 rounded-md text-xs"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-[#E8D5B7]">Storage Location Description</label>
            <textarea 
              required
              value={docForm.location_description}
              onChange={(e) => setDocForm(prev => ({ ...prev, location_description: e.target.value }))}
              placeholder="e.g. In the brown paper folder, bottom study drawer in our master bedroom."
              rows={3}
              className="py-2 px-3 rounded-md text-xs"
            />
          </div>
          <Button type="submit" loading={saving} className="w-full justify-center py-2.5 text-xs btn-primary-premium rounded-lg">
            Save Document Record
          </Button>
        </form>
      </Modal>

      {/* Asset Modal */}
      <Modal isOpen={activeModal === 'asset'} onClose={() => setActiveModal(null)} title="Add Financial Asset">
        {formError && <div className="bg-red-950 border border-red-800 text-red-200 text-xs p-2.5 rounded mb-3">{formError}</div>}
        <form onSubmit={handleAddAsset} className="space-y-4 font-sans text-xs">
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-[#E8D5B7]">Asset Category</label>
            <select 
              value={assetForm.asset_type}
              onChange={(e) => setAssetForm(prev => ({ ...prev, asset_type: e.target.value }))}
              className="py-2 px-3 rounded-md text-xs w-full"
            >
              <option value="bank">Bank Account</option>
              <option value="investment">Investment Portfolio</option>
              <option value="crypto">Cryptocurrency Wallet</option>
              <option value="property">Real Estate Asset</option>
              <option value="other">General Asset</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-[#E8D5B7]">Institution / Holder Name</label>
            <input 
              type="text" 
              required
              value={assetForm.institution}
              onChange={(e) => setAssetForm(prev => ({ ...prev, institution: e.target.value }))}
              placeholder="e.g. Chase Bank, Fidelity, Coinbase"
              className="py-2 px-3 rounded-md text-xs"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-[#E8D5B7]">Description</label>
            <input 
              type="text" 
              value={assetForm.description}
              onChange={(e) => setAssetForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="e.g. Savings account or cryptocurrency hot-wallet"
              className="py-2 px-3 rounded-md text-xs"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-[#E8D5B7]">Designated Recipient</label>
            <input 
              type="text" 
              value={assetForm.designated_recipient}
              onChange={(e) => setAssetForm(prev => ({ ...prev, designated_recipient: e.target.value }))}
              placeholder="e.g. Spouse / Brother / Children"
              className="py-2 px-3 rounded-md text-xs"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-[#E8D5B7]">Additional Notes</label>
            <textarea 
              value={assetForm.notes}
              onChange={(e) => setAssetForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="e.g. Key shares divided among guardians."
              rows={2}
              className="py-2 px-3 rounded-md text-xs"
            />
          </div>
          <Button type="submit" loading={saving} className="w-full justify-center py-2.5 text-xs btn-primary-premium rounded-lg">
            Save Financial Asset
          </Button>
        </form>
      </Modal>

      {/* Contact Modal */}
      <Modal isOpen={activeModal === 'contact'} onClose={() => setActiveModal(null)} title="Add Trusted Contact">
        {formError && <div className="bg-red-950 border border-red-800 text-red-200 text-xs p-2.5 rounded mb-3">{formError}</div>}
        <form onSubmit={handleAddContact} className="space-y-4 font-sans text-xs">
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-[#E8D5B7]">Contact Full Name</label>
            <input 
              type="text" 
              required
              value={contactForm.full_name}
              onChange={(e) => setContactForm(prev => ({ ...prev, full_name: e.target.value }))}
              placeholder="e.g. Sarah Jenkins"
              className="py-2 px-3 rounded-md text-xs"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-[#E8D5B7]">Relationship</label>
            <input 
              type="text" 
              value={contactForm.relationship}
              onChange={(e) => setContactForm(prev => ({ ...prev, relationship: e.target.value }))}
              placeholder="e.g. Spouse, Cousin, Friend"
              className="py-2 px-3 rounded-md text-xs"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-[#E8D5B7]">Email Address</label>
            <input 
              type="email" 
              value={contactForm.email}
              onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
              placeholder="sarah@example.com"
              className="py-2 px-3 rounded-md text-xs"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-[#E8D5B7]">Phone Number</label>
            <input 
              type="text" 
              value={contactForm.phone}
              onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="e.g. +1 (555) 019-2834"
              className="py-2 px-3 rounded-md text-xs"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-[#E8D5B7]">Designated Role</label>
            <select 
              value={contactForm.role}
              onChange={(e) => setContactForm(prev => ({ ...prev, role: e.target.value }))}
              className="py-2 px-3 rounded-md text-xs w-full"
            >
              <option value="executor">Executor (Hold Activation Rights)</option>
              <option value="family">Immediate Family</option>
              <option value="trusted_friend">Trusted Friend</option>
            </select>
          </div>
          <Button type="submit" loading={saving} className="w-full justify-center py-2.5 text-xs btn-primary-premium rounded-lg">
            Save Trusted Contact
          </Button>
        </form>
      </Modal>
    </div>
  );
}
