import { useState, useEffect } from 'react';
import { getAccountsByCustomerId } from '../services/apiClient';

export function useAccounts(customerId) {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!customerId) {
      setIsLoading(false);
      return;
    }

    const loadAccounts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getAccountsByCustomerId(customerId);
        setAccounts(data);
      } catch (err) {
        setError(err.message || 'Error loading accounts');
        setAccounts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAccounts();
  }, [customerId]);

  return { accounts, isLoading, error };
}
