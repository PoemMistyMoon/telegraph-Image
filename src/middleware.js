import { auth } from "@/auth"

const ROOT = '/';
const LOGIN = '/login';
const PUBLIC_ROUTES = ['/login', '/api/cfile'];
const API_ADMIN = "/api/admin";
const ADMIN_PAGE = "/admin";
const AUTH_API = "/api/enableauthapi";
const enableAuthapi = process.env.ENABLE_AUTH_API === 'true';

export default auth(async (req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  const role = req?.auth?.user?.role;
  const isAuthenticated = !!req.auth;

  const isPublicRoute = PUBLIC_ROUTES.some((path) => pathname.startsWith(path));
  const isAPI_ADMIN = pathname.startsWith(API_ADMIN);
  const isADMIN_PAGE = pathname.startsWith(ADMIN_PAGE);
  const isAuthAPI = pathname.startsWith(AUTH_API);

  // 已经登录还访问/login，就跳回 /
  if (isAuthenticated && pathname === LOGIN) {
    return Response.redirect(new URL(ROOT, nextUrl));
  }

  // login和/api/cfile是公开的，允许访问
  if (isPublicRoute) {
    return;
  }

  // 未登录访问其他页面，直接跳到/login（不带callbackUrl）
  if (!isAuthenticated) {
    return Response.redirect(new URL(LOGIN, nextUrl));
  }

  // 登录后根据角色做限制
  if (role === 'admin') {
    return;
  }

  if (role === 'user') {
    if (isAPI_ADMIN || isADMIN_PAGE) {
      return Response.redirect(new URL(ROOT, nextUrl));
    }
  }

  return;
})

// 静态拦截配置
export const config = {
  matcher: [
    "/((?!_next|favicon.ico).*)",
  ],
};
