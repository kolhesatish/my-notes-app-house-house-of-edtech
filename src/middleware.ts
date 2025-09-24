import { NextResponse, NextRequest } from "next/server";

const API_PROTECTED = [/^\/api\/notes(\/.*)?$/, /^\/api\/ai\/(summarize|tags)(\/.*)?$/];
const PAGE_PROTECTED = [/^\/dashboard(\/.*)?$/, /^\/notes(\/.*)?$/];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;
  const isApi = API_PROTECTED.some((re) => re.test(pathname));
  const isProtectedPage = PAGE_PROTECTED.some((re) => re.test(pathname));

  if (!token && (isApi || isProtectedPage)) {
    if (isApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/notes/:path*",
    "/api/notes/:path*",
    "/api/ai/:path*",
  ],
};
