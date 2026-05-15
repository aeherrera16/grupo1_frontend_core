const SESSION_KEY = 'banquito_session';

export const setSession = (user) => {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error saving session to localStorage:', error);
    }
  }
};

export const getSession = () => {
  try {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error reading session from localStorage:', error);
    }
    return null;
  }
};

export const clearSession = () => {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error clearing session from localStorage:', error);
    }
  }
};

export const isSessionValid = () => {
  const session = getSession();
  return session && session.isAuthenticated && session.coreUserId;
};
