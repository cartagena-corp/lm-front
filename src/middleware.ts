import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Rutas que solo puede ver un NO autenticado
const authPages = ["/login", "/login/callback", "/dev/get/criptograma"];

// Rutas que requieren autenticación
const privatePages = ["/tableros", "/factory", "/config", "/gemini"];

// Decodifica el payload de un JWT sin verificar firma (el middleware de Edge no tiene
// el secreto del backend); solo se usa para una redirección temprana por UX, la
// autorización real sigue viviendo en el backend en cada request.
function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split(".")[1];
    if (!payload) return true;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    const { exp } = JSON.parse(json) as { exp?: number };
    if (!exp) return false;
    return exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("NEXT_COOKIE_ACCESS_TOKEN")?.value;
  const hasValidSession = !!token && !isTokenExpired(token);
  const { pathname } = request.nextUrl;

  if (hasValidSession && authPages.includes(pathname)) {
    return NextResponse.redirect(new URL("/tableros", request.url));
  }
  if (!hasValidSession && privatePages.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)",
  ],
};
