"use client";

export function setSessionCookie(uid: string) {
  document.cookie = `loc-admin-session=${uid}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export function clearSessionCookie() {
  document.cookie = "loc-admin-session=; path=/; max-age=0";
}
