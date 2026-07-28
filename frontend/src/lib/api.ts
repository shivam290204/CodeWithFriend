const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const WS_URL = import.meta.env.VITE_WS_URL || API_URL;

export function getApiBase() {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, "");
  }
  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    // For local network testing (e.g., 192.168.x.x)
    return `http://${window.location.hostname}:5000`;
  }
  return API_URL.replace(/\/$/, "");
}

export function getWsBase() {
  let base = "";
  if (import.meta.env.VITE_WS_URL) {
    base = import.meta.env.VITE_WS_URL.replace(/\/$/, "");
  } else if (import.meta.env.VITE_API_URL) {
    base = import.meta.env.VITE_API_URL.replace(/\/$/, "");
  } else if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    base = `http://${window.location.hostname}:5000`;
  } else {
    base = WS_URL.replace(/\/$/, "");
  }
  
  return base.replace(/^http:/, "ws:").replace(/^https:/, "wss:");
}

export function buildRoomSocketUrl(roomCode: string, token?: string | null) {
  const base = `${getWsBase()}/ws/room/${roomCode}`;
  if (!token) {
    return base;
  }

  return `${base}?token=${encodeURIComponent(token)}`;
}

export function readStoredName() {
  if (typeof window === "undefined") return "Guest";
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
  user?: {
    name?: string;
    username?: string;
    email?: string;
  };
  name?: string;
  username?: string;
  email?: string;
};

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

    // Token refresh interceptor
    if (response.status === 401 && rawMsg === 'TOKEN_EXPIRED') {
      try {
        const refreshRes = await fetch(`${getApiBase()}/api/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        if (refreshRes.ok) {
          // Retry original request
          const retryRes = await fetch(url, {
            credentials: 'include',
            ...options,
            headers,
          });
          const retryText = await retryRes.text();
          let retryPayload: any = null;
          if (retryText) {
            try { retryPayload = JSON.parse(retryText); } catch { retryPayload = retryText; }
          }
          if (!retryRes.ok) throw new Error(`Retry failed: HTTP ${retryRes.status}`);
          return retryPayload as T;
        } else {
          // Refresh failed, clear local state and redirect to login
          persistAuthed(false);
          persistName(null);
          if (typeof window !== "undefined") {
            window.location.href = '/login';
          }
          throw new Error('Session expired');
        }
      } catch (err) {
        throw new Error('Session expired');
      }
    }

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
  try {
    const response = await fetch(`${getApiBase()}/api/auth/me`, { credentials: "include" });
    if (response.ok) {
      const data = await response.json();
      return { isAuthed: true, user: data.user };
    }
    if (response.status === 401 || response.status === 403) {
      if (typeof window !== "undefined") localStorage.removeItem("codesync-authed");
      return { isAuthed: false, user: null };
    }
  } catch {
    // network error
  }
  
  if (typeof window !== "undefined") {
    return { isAuthed: localStorage.getItem("codesync-authed") === "true", user: null };
  }
  return { isAuthed: false, user: null };
}
