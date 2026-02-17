import React, { createContext, useContext, useState, useEffect } from 'react';

// Interface Update
interface AuthContextType {
    isAuthenticated: boolean;
    user: { email: string; name: string; role: 'admin' | 'user' } | null;
    login: (email: string, pass: string) => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<{ email: string; name: string; role: 'admin' | 'user' } | null>(null);

    useEffect(() => {
        // Check local storage on mount (optional persistence for demo)
        const storedUser = localStorage.getItem('aegis_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
        }
    }, []);

    const login = (email: string, pass: string) => {
        // Demo Credentials
        if (email === 'vikastiwari1045@gmail.com' && pass === 'Vikas123@') {
            const demoUser = { email, name: 'Vikas Tiwari', role: 'admin' as const };
            setUser(demoUser);
            setIsAuthenticated(true);
            localStorage.setItem('aegis_user', JSON.stringify(demoUser));
            return true;
        }

        // User Credentials
        if (email === 'user@agesai.com' && pass === 'user123@') {
            const demoUser = { email, name: 'User', role: 'user' as const };
            setUser(demoUser);
            setIsAuthenticated(true);
            localStorage.setItem('aegis_user', JSON.stringify(demoUser));
            return true;
        }

        return false;
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('aegis_user');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
