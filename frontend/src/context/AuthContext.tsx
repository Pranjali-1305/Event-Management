import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  _id: string;
  club_id: string;
  exp: number;
}

interface AuthContextType {
  token: string | null;
  adminClubId: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  adminClubId: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [adminClubId, setAdminClubId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('admin_token');
    if (stored) {
      try {
        const decoded = jwtDecode<JwtPayload>(stored);
        if (decoded.exp * 1000 > Date.now()) {
          setToken(stored);
          setAdminClubId(decoded.club_id);
        } else {
          localStorage.removeItem('admin_token');
        }
      } catch {
        localStorage.removeItem('admin_token');
      }
    }
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem('admin_token', newToken);
    const decoded = jwtDecode<JwtPayload>(newToken);
    setToken(newToken);
    setAdminClubId(decoded.club_id);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setAdminClubId(null);
  };

  return (
    <AuthContext.Provider value={{ token, adminClubId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
