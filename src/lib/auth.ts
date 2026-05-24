"use client";

export type Operator = {
  id: number;
  email: string;
  name: string;
  role: string;
};

const tokenKey = "airdanapi.console.token";
const operatorKey = "airdanapi.console.operator";

export function getToken() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(tokenKey);
}

export function saveSession(token: string, operator: Operator) {
  window.localStorage.setItem(tokenKey, token);
  window.localStorage.setItem(operatorKey, JSON.stringify(operator));
}

export function clearSession() {
  window.localStorage.removeItem(tokenKey);
  window.localStorage.removeItem(operatorKey);
}

export function getOperator(): Operator | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(operatorKey);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as Operator;
  } catch {
    clearSession();
    return null;
  }
}
