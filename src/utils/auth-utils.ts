export type UserRole = "admin" | "user" | "tenant";

export interface UserSession {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

// In a real app, this would use a library like 'cookies-next' or native cookies
export const getSessionFromCookies = (
  cookieString?: string,
): UserSession | null => {
  if (!cookieString) return null;

  // Parse cookies
  const cookies: { [key: string]: string } = {};
  cookieString.split(";").forEach((cookie) => {
    const [name, value] = cookie.trim().split("=");
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });

  const role = cookies["session_role"] as UserRole;
  const userInfo = cookies["user_info"];

  if (role && userInfo) {
    try {
      const user = JSON.parse(userInfo);
      return {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      };
    } catch (error) {
      console.error("Error parsing user info from cookie:", error);
      return null;
    }
  }

  return null;
};

// Mock function to get session (in real app, this would check cookies/JWT)
export const getSession = (): UserSession | null => {
  if (typeof window === "undefined") return null;
  const session = localStorage.getItem("session");
  return session ? JSON.parse(session) : null;
};

export const setSession = (
  session: UserSession,
  token?: string,
  expiresDays = 7,
) => {
  if (typeof window === "undefined") return;

  // Save to localStorage
  localStorage.setItem("session", JSON.stringify(session));

  // Set cookies for middleware and SSR access
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + expiresDays);
  const expires = expiryDate.toUTCString();

  if (token) {
    document.cookie = `session_token=${token}; path=/; expires=${expires}; SameSite=Lax`;
  }
  document.cookie = `session_role=${session.role}; path=/; expires=${expires}; SameSite=Lax`;
  document.cookie = `user_info=${encodeURIComponent(JSON.stringify(session))}; path=/; expires=${expires}; SameSite=Lax`;
};

export const clearSession = () => {
  if (typeof window === "undefined") return;

  // Clear localStorage
  localStorage.removeItem("session");

  // Clear cookies by setting them to expire
  const cookiesToClear = ["session_token", "session_role", "user_info"];
  cookiesToClear.forEach((cookieName) => {
    document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  });
};

export const validateSession = (autoLogout = true): boolean => {
  const session = getSession();
  if (!session) return false;

  // Check if token exists and is not expired
  const token = getCookieValue("session_token");
  if (!token) return false;

  try {
    // Decode JWT payload (without verification for client-side)
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < currentTime) {
      // Token expired, only clear session if autoLogout is true
      if (autoLogout) {
        clearSession();
      }
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error validating token:", error);
    if (autoLogout) {
      clearSession();
    }
    return false;
  }
};

// Check if session is valid without auto-logout
export const checkSessionValidity = (): boolean => {
  return validateSession(false);
};

// Refresh session by extending cookie expiration
export const refreshSession = (): boolean => {
  const session = getSession();
  if (!session) return false;

  const token = getCookieValue("session_token");
  if (!token) return false;

  // Extend cookie expiration by 7 days from now
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7);
  const expires = expiryDate.toUTCString();

  // Refresh cookies with new expiration
  document.cookie = `session_token=${token}; path=/; expires=${expires}; SameSite=Lax`;
  document.cookie = `session_role=${session.role}; path=/; expires=${expires}; SameSite=Lax`;
  document.cookie = `user_info=${encodeURIComponent(JSON.stringify(session))}; path=/; expires=${expires}; SameSite=Lax`;

  return true;
};

// Auto-refresh session on user activity
export const setupSessionRefresh = (): (() => void) => {
  if (typeof window === "undefined") return () => {};

  let refreshTimer: NodeJS.Timeout;
  const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

  const refresh = () => {
    if (checkSessionValidity()) {
      refreshSession();
    }
  };

  const setupTimer = () => {
    refreshTimer = setInterval(refresh, REFRESH_INTERVAL);
  };

  const handleActivity = () => {
    // Reset timer on user activity
    clearInterval(refreshTimer);
    setupTimer();
  };

  // Setup initial timer
  setupTimer();

  // Add activity listeners
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
  events.forEach(event => {
    document.addEventListener(event, handleActivity, true);
  });

  // Cleanup function
  return () => {
    clearInterval(refreshTimer);
    events.forEach(event => {
      document.removeEventListener(event, handleActivity, true);
    });
  };
};

const getCookieValue = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};
