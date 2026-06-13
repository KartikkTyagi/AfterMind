import React, { useState } from 'react';
import { Download, CheckSquare, Square, FileText, Globe, Landmark, Users, Mail, HelpCircle } from 'lucide-react';
import Button from '../ui/Button';

export default function TaskChecklist({ 
  accounts = [], 
  documents = [], 
  assets = [], 
  contacts = [],
  estateId = null,
  accessCode = ""
}) {
  const handleDownload = () => {
    if (estateId && accessCode) {
      window.open(`http://localhost:3001/api/reports/generate/${estateId}?code=${accessCode}`, '_blank');
    }
  };
  const [checkedItems, setCheckedItems] = useState({});

  const toggleCheck = (id) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const executor = contacts.find(c => c.role === 'executor') || contacts[0];

  // Compile tasks
  const tasks = [];

  // 1. Report Task
  tasks.push({
    id: 'download_report',
    category: 'admin',
    title: 'Download Digital Estate Report',
    description: 'Get a consolidated copy of all recorded digital assets, contacts, and wishes.',
    type: 'report'
  });

  // 2. Executor Task
  if (executor) {
    tasks.push({
      id: 'contact_executor',
      category: 'admin',
      title: `Coordinate with Executor: ${executor.full_name}`,
      description: `Reach out to the designated executor (${executor.email || 'No email registered'}) to coordinate legal affairs.`,
      type: 'executor'
    });
  }

  // 3. Digital Accounts Tasks
  accounts.forEach(acc => {
    let actionDesc = "";
    if (acc.action === 'delete') actionDesc = `Submit account deletion request for ${acc.platform}.`;
    else if (acc.action === 'cancel') actionDesc = `Cancel active subscription/billing for ${acc.platform}.`;
    else if (acc.action === 'memorialize') actionDesc = `Submit request to memorialize ${acc.platform} account.`;
    else actionDesc = `Initiate transfer of ${acc.platform} credentials or content.`;

    tasks.push({
      id: `acc_${acc.id}`,
      category: 'accounts',
      title: `Handle ${acc.platform} Account (${acc.account_email})`,
      description: `${actionDesc} ${acc.notes ? `Note: "${acc.notes}"` : ''}`,
      type: 'account',
      badge: acc.action
    });
  });

  // 4. Documents Tasks
  documents.forEach(doc => {
    tasks.push({
      id: `doc_${doc.id}`,
      category: 'documents',
      title: `Locate ${doc.document_name}`,
      description: `Retrieve the physical document. Location specified: "${doc.location_description || 'Not specified'}"`,
      type: 'document',
      badge: doc.document_type
    });
  });

  // 5. Financial Assets Tasks
  assets.forEach(asset => {
    tasks.push({
      id: `asset_${asset.id}`,
      category: 'assets',
      title: `Notify ${asset.institution} (${asset.asset_type})`,
      description: `Contact institution regarding accounts. Designated recipient: ${asset.designated_recipient || 'Family'}. Description: ${asset.description}`,
      type: 'asset'
    });
  });

  const getActionColor = (action) => {
    switch (action) {
      case 'delete': return 'bg-red-50 text-red-700 border-red-100';
      case 'cancel': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'transfer': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'memorialize': return 'bg-purple-50 text-purple-700 border-purple-100';
      default: return 'bg-cream text-deep-brown border-cream';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'report': return <Download size={16} className="text-amber" />;
      case 'executor': return <Users size={16} className="text-warm-brown" />;
      case 'account': return <Globe size={16} className="text-amber" />;
      case 'document': return <FileText size={16} className="text-soft-gold" />;
      case 'asset': return <Landmark size={16} className="text-muted-rose" />;
      default: return <HelpCircle size={16} className="text-deep-brown" />;
    }
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      {tasks.map((task) => {
        const isChecked = !!checkedItems[task.id];
        
        return (
          <div 
            key={task.id}
            className={`flex items-start gap-4 p-4 border rounded-xl transition-all duration-300 ${
              isChecked 
                ? 'bg-cream/10 border-cream/50 opacity-60' 
                : 'bg-warm-white border-[#E6DEC9] shadow-sm hover:shadow-soft'
            }`}
          >
            {/* Checkbox Trigger */}
            {task.type === 'report' ? (
              <button 
                onClick={handleDownload}
                className="bg-amber text-warm-white p-2.5 rounded-lg hover:bg-warm-brown flex items-center justify-center shadow-sm"
                title="Download Report"
              >
                <Download size={16} />
              </button>
            ) : (
              <button 
                onClick={() => toggleCheck(task.id)}
                className="text-muted-rose hover:text-amber transition-colors mt-1 flex-shrink-0"
              >
                {isChecked ? (
                  <CheckSquare size={20} className="text-amber" />
                ) : (
                  <Square size={20} />
                )}
              </button>
            )}

            {/* Task Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex-shrink-0">{getIcon(task.type)}</span>
                <h4 className={`font-sans text-sm font-semibold text-deep-brown ${isChecked ? 'line-through text-muted-rose' : ''}`}>
                  {task.title}
                </h4>
                {task.badge && (
                  <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${getActionColor(task.badge)}`}>
                    {task.badge}
                  </span>
                )}
              </div>
              <p className={`font-serif text-xs text-muted-rose mt-1 leading-relaxed ${isChecked ? 'text-muted-rose/60' : ''}`}>
                {task.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
