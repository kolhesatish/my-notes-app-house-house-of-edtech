import { NextResponse, NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";

const API_PROTECTED = [/^\/api\/notes(\/.*)?$/, /^\/api\/ai\/(summarize|tags)(\/.*)?$/];
const PAGE_PROTECTED = [/^\/dashboard(\/.*)?$/, /^\/notes(\/.*)?$/];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;
  const verified = token ? verifyToken(token) : null;

  const isApi = API_PROTECTED.some((re) => re.test(pathname));
  const isProtectedPage = PAGE_PROTECTED.some((re) => re.test(pathname));

  if (!verified && (isApi || isProtectedPage)) {
    if (isApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const requestHeaders = new Headers(req.headers);
  if (verified?.sub) {
    requestHeaders.set("x-user-id", verified.sub);
    if (verified.email) requestHeaders.set("x-user-email", verified.email);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/notes/:path*",
    "/api/notes/:path*",
    "/api/ai/:path*",
  ],
};
