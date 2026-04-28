import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import type { UserRole } from "@/domain/types/auth";

const protectedRoutes: { prefix: string; roles: UserRole[] }[] = [
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/mentor", roles: ["mentor", "admin"] },
  { prefix: "/mentee", roles: ["mentee", "admin"] },
  { prefix: "/dashboard", roles: ["admin", "mentor", "mentee"] },
];

function getRouteRule(pathname: string) {
  return protectedRoutes.find((route) => pathname.startsWith(route.prefix));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const routeRule = getRouteRule(pathname);

  if (!routeRule) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token?.sub || !token.role) {
    const signInUrl = new URL("/login", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (!routeRule.roles.includes(token.role as UserRole)) {
    return NextResponse.redirect(new URL("/forbidden", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/mentor/:path*", "/mentee/:path*", "/dashboard/:path*"],
};
