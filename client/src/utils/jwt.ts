import { jwtDecode } from "jwt-decode";

export function getTokenExpMs(token?: string | null): number | null {
  if (!token) return null;
  try {
    const { exp } = jwtDecode<{ exp?: number }>(token);
    return typeof exp === "number" ? exp * 1000 : null;
  } catch {
    return null;
  }
}

export function msUntilExp(token?: string | null): number | null {
  const expMs = getTokenExpMs(token);
  if (!expMs) return null;
  return expMs - Date.now();
}

export function isTokenExpiringSoon(token?: string | null, skewMs = 30_000): boolean {
  const left = msUntilExp(token);
  return left === null || left <= skewMs;
}