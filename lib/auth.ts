const SESSION_KEY = "battery-analytics-session";

export type Session = {
  email: string;
  name: string;
  loggedInAt: string;
};

export function login(email: string, password: string): Promise<Session> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const session: Session = {
        email,
        name: email.split("@")[0] || "User",
        loggedInAt: new Date().toISOString(),
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      resolve(session);
    }, 600 + Math.random() * 400);
  });
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}
