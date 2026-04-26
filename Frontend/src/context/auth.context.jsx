import { createContext, useContext, useState } from "react";

const AuthContext = createContext();
const STORAGE_KEY = "user";

const getStoredUser = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  
  const [user, setUser] = useState(() => getStoredUser());

  const login = (data) => {
    setUser(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
