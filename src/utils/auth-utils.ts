export type UserRole = 'admin' | 'user';

export interface UserSession {
    id: string;
    email: string;
    role: UserRole;
    name: string;
}

// In a real app, this would use a library like 'cookies-next' or native cookies
export const getSessionFromCookies = (cookieString?: string): UserSession | null => {
    // Mock: If cookie 'session_role' exists, return a mock session
    if (!cookieString) return null;

    if (cookieString.includes('session_role=admin')) {
        return { id: '1', email: 'admin@lodge.com', role: 'admin', name: 'Admin User' };
    }
    if (cookieString.includes('session_role=user')) {
        return { id: '2', email: 'user@lodge.com', role: 'user', name: 'Lodge Resident' };
    }
    return null;
};

// Mock function to get session (in real app, this would check cookies/JWT)
export const getSession = (): UserSession | null => {
    if (typeof window === 'undefined') return null;
    const session = localStorage.getItem('session');
    return session ? JSON.parse(session) : null;
};

export const setSession = (session: UserSession) => {
    localStorage.setItem('session', JSON.stringify(session));
};

export const clearSession = () => {
    localStorage.removeItem('session');
};
