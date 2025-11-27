export interface User {
  id?: string;
  email: string;
  name: string;
  username?: string;
  role?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, username: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}
