import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const EstateContext = createContext(null);

export const EstateProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [estateProfile, setEstateProfile] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [assets, setAssets] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch full estate profile details
  const fetchEstateData = async (estateId) => {
    if (!estateId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.estate.getDetails(estateId);
      setEstateProfile(data.estate);
      setAccounts(data.accounts);
      setDocuments(data.documents);
      setAssets(data.financial_assets);
      setContacts(data.trusted_contacts);
      setCapsules(data.time_capsules);
    } catch (err) {
      console.error("[Estate Context] Error fetching details:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Automatically fetch estate data when authenticated and user.estate_id is present
  useEffect(() => {
    if (isAuthenticated && user?.estate_id) {
      fetchEstateData(user.estate_id);
    } else {
      // Clear state on logout
      setEstateProfile(null);
      setAccounts([]);
      setDocuments([]);
      setAssets([]);
      setContacts([]);
      setCapsules([]);
    }
  }, [isAuthenticated, user?.estate_id]);

  /* =========================================================================
     ACCOUNTS OPERATIONS
     ========================================================================= */
  const addAccount = async (accountData) => {
    try {
      await api.accounts.create(accountData);
      await fetchEstateData(user.estate_id);
    } catch (err) {
      console.error("[Estate Context] Add account error:", err.message);
      throw err;
    }
  };

  const editAccount = async (id, accountData) => {
    try {
      await api.accounts.update(id, accountData);
      await fetchEstateData(user.estate_id);
    } catch (err) {
      console.error("[Estate Context] Edit account error:", err.message);
      throw err;
    }
  };

  const removeAccount = async (id) => {
    try {
      await api.accounts.delete(id);
      await fetchEstateData(user.estate_id);
    } catch (err) {
      console.error("[Estate Context] Remove account error:", err.message);
      throw err;
    }
  };

  /* =========================================================================
     DOCUMENTS OPERATIONS
     ========================================================================= */
  const addDocument = async (docData) => {
    try {
      await api.documents.create(docData);
      await fetchEstateData(user.estate_id);
    } catch (err) {
      console.error("[Estate Context] Add document error:", err.message);
      throw err;
    }
  };

  const removeDocument = async (id) => {
    try {
      await api.documents.delete(id);
      await fetchEstateData(user.estate_id);
    } catch (err) {
      console.error("[Estate Context] Remove document error:", err.message);
      throw err;
    }
  };

  /* =========================================================================
     FINANCIAL ASSETS OPERATIONS
     ========================================================================= */
  const addAsset = async (assetData) => {
    try {
      await api.assets.create(assetData);
      await fetchEstateData(user.estate_id);
    } catch (err) {
      console.error("[Estate Context] Add asset error:", err.message);
      throw err;
    }
  };

  const editAsset = async (id, assetData) => {
    try {
      await api.assets.update(id, assetData);
      await fetchEstateData(user.estate_id);
    } catch (err) {
      console.error("[Estate Context] Edit asset error:", err.message);
      throw err;
    }
  };

  const removeAsset = async (id) => {
    try {
      await api.assets.delete(id);
      await fetchEstateData(user.estate_id);
    } catch (err) {
      console.error("[Estate Context] Remove asset error:", err.message);
      throw err;
    }
  };

  /* =========================================================================
     TRUSTED CONTACTS OPERATIONS
     ========================================================================= */
  const addContact = async (contactData) => {
    try {
      await api.contacts.create(contactData);
      await fetchEstateData(user.estate_id);
    } catch (err) {
      console.error("[Estate Context] Add contact error:", err.message);
      throw err;
    }
  };

  const editContact = async (id, contactData) => {
    try {
      await api.contacts.update(id, contactData);
      await fetchEstateData(user.estate_id);
    } catch (err) {
      console.error("[Estate Context] Edit contact error:", err.message);
      throw err;
    }
  };

  const removeContact = async (id) => {
    try {
      await api.contacts.delete(id);
      await fetchEstateData(user.estate_id);
    } catch (err) {
      console.error("[Estate Context] Remove contact error:", err.message);
      throw err;
    }
  };

  /* =========================================================================
     TIME CAPSULES OPERATIONS
     ========================================================================= */
  const addCapsule = async (capsuleData) => {
    try {
      await api.capsules.create(capsuleData);
      await fetchEstateData(user.estate_id);
    } catch (err) {
      console.error("[Estate Context] Add capsule error:", err.message);
      throw err;
    }
  };

  const editCapsule = async (id, capsuleData) => {
    try {
      await api.capsules.update(id, capsuleData);
      await fetchEstateData(user.estate_id);
    } catch (err) {
      console.error("[Estate Context] Edit capsule error:", err.message);
      throw err;
    }
  };

  const removeCapsule = async (id) => {
    try {
      await api.capsules.delete(id);
      await fetchEstateData(user.estate_id);
    } catch (err) {
      console.error("[Estate Context] Remove capsule error:", err.message);
      throw err;
    }
  };

  return (
    <EstateContext.Provider value={{
      estateProfile,
      accounts,
      documents,
      assets,
      contacts,
      capsules,
      loading,
      error,
      refreshEstateData: () => fetchEstateData(user?.estate_id),
      addAccount,
      editAccount,
      removeAccount,
      addDocument,
      removeDocument,
      addAsset,
      editAsset,
      removeAsset,
      addContact,
      editContact,
      removeContact,
      addCapsule,
      editCapsule,
      removeCapsule
    }}>
      {children}
    </EstateContext.Provider>
  );
};

export const useEstate = () => useContext(EstateContext);
