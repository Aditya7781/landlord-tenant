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

export const validateSession = (): boolean => {
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
      // Token expired, clear session
      clearSession();
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error validating token:", error);
    clearSession();
    return false;
  }
};

const getCookieValue = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};
