import { useState, useEffect } from 'react';

export const useFetch = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiFunction();
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Error al cargar los datos');
      } finally {
        setIsLoading(false);
      }
    };

    if (apiFunction) {
      fetchData();
    }
  }, dependencies);

  return { data, error, isLoading };
};

export default useFetch;
