const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const WS_URL = import.meta.env.VITE_WS_URL || API_URL;

export function getApiBase() {
  return API_URL.replace(/\/$/, "");
}

export function getWsBase() {
  return WS_URL.replace(/\/$/, "").replace(/^http:/, "ws:").replace(/^https:/, "wss:");
}

export function buildRoomSocketUrl(roomCode: string, token?: string | null) {
  const base = `${getWsBase()}/ws/room/${roomCode}`;
  if (!token) {
    return base;
  }

  return `${base}?token=${encodeURIComponent(token)}`;
}

export function readStoredToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("codesync-token");
}

interface ClerkWindow extends Window {
  Clerk?: {
    session?: {
      getToken(): Promise<string | null>;
    };
    user?: {
      firstName?: string | null;
      fullName?: string | null;
      username?: string | null;
    };
  };
}

export async function getActiveToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const clerkWindow = window as unknown as ClerkWindow;
  if (clerkWindow.Clerk?.session) {
    try {
      const clerkToken = await clerkWindow.Clerk.session.getToken();
      if (clerkToken) {
        return clerkToken;
      }
    } catch {
      // Ignore and fallback
    }
  }
  return localStorage.getItem("codesync-token");
}

export function persistToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("codesync-token", token);
  } else {
    localStorage.removeItem("codesync-token");
  }
}

export function readStoredName() {
  if (typeof window === "undefined") return "Guest";
  const clerkWindow = window as unknown as ClerkWindow;
  if (clerkWindow.Clerk?.user) {
    const u = clerkWindow.Clerk.user as any;
    let name = u.firstName || u.fullName || u.username;
    if (!name && u.primaryEmailAddress?.emailAddress) {
      name = u.primaryEmailAddress.emailAddress.split("@")[0];
    }
    return name || "User";
  }
  const stored = localStorage.getItem("codesync-name") || "Guest";
  return stored.includes("@") && !stored.includes(" ") ? stored.split("@")[0] : stored;
}

export function persistName(name: string | null) {
  if (typeof window === "undefined") return;
  if (name) {
    const cleanName = name.includes("@") && !name.includes(" ") ? name.split("@")[0] : name;
    localStorage.setItem("codesync-name", cleanName);
  } else {
    localStorage.removeItem("codesync-name");
  }
}

type AuthPayload = {
  token?: string;
  accessToken?: string;
  jwt?: string;
  access_token?: string;
  user?: {
    name?: string;
    username?: string;
    email?: string;
  };
  name?: string;
  username?: string;
  email?: string;
};

export function extractToken(payload: AuthPayload | null | undefined) {
  return payload?.token || payload?.accessToken || payload?.jwt || payload?.access_token || null;
}

export function extractUserName(payload: AuthPayload | null | undefined) {
  const raw = payload?.name || payload?.username || payload?.user?.name || payload?.user?.username || payload?.user?.email || payload?.email || "Guest";
  return raw.includes("@") && !raw.includes(" ") ? raw.split("@")[0] : raw;
}

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return fallback;
}

export async function fetchJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = path.startsWith("http") ? path : `${getApiBase()}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(options.headers || {});

  const token = await getActiveToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    credentials: "include",
    ...options,
    headers,
  });

  const text = await response.text();
  let payload: unknown = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    let rawMsg = "";
    if (typeof payload === "object" && payload !== null) {
      const obj = payload as Record<string, unknown>;
      if (typeof obj.error === "string" && obj.error) {
        rawMsg = obj.error;
      } else if (typeof obj.message === "string" && obj.message) {
        rawMsg = obj.message;
      }
      if (typeof obj.details === "string" && obj.details && obj.details !== rawMsg) {
        rawMsg = rawMsg ? `${rawMsg} (${obj.details})` : obj.details;
      }
    } else if (typeof payload === "string" && payload) {
      rawMsg = payload;
    }

    const message = rawMsg
      ? `(HTTP ${response.status}) ${rawMsg}`
      : `Request failed with HTTP status ${response.status}`;
    throw new Error(message);
  }

  if (payload === null || payload === undefined) {
    return {} as T;
  }

  return payload as T;
}

export function persistAuthed(authed: boolean) {
  if (typeof window === "undefined") return;
  if (authed) {
    localStorage.setItem("codesync-authed", "true");
  } else {
    localStorage.removeItem("codesync-authed");
  }
}

export async function probeAuth() {
  const paths = ["/api/auth/me", "/api/auth/whoami", "/api/auth/profile", "/api/users/me"];
  const token = await getActiveToken();
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  for (const path of paths) {
    try {
      const response = await fetch(`${getApiBase()}${path}`, { credentials: "include", headers });
      if (response.ok) {
        return true;
      }
      if (response.status === 401 || response.status === 403) {
        if (typeof window !== "undefined") localStorage.removeItem("codesync-authed");
        return false;
      }
    } catch {
      // Ignore and try the next probe.
    }
  }

  // If backend does not implement a /me endpoint (404), fall back to stored session or token
  if (typeof window !== "undefined") {
    return localStorage.getItem("codesync-authed") === "true" || Boolean(readStoredToken());
  }
  return false;
}
