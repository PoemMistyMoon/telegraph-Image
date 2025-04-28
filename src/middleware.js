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

  if (isAuthenticated) {
    // 如果已经登录，还访问/login，跳转到根目录
    if (pathname === LOGIN) {
      return Response.redirect(new URL(ROOT, nextUrl));
    }
  }

  if (!isAuthenticated) {
    if (isPublicRoute) {
      // 允许访问 /login 和 /api/cfile
      return;
    }
    if (isAPI_ADMIN) {
      return Response.json(
        { status: "fail", message: "You are not logged in by admin !", success: false },
        { status: 401 },
      )
    }
    if (isADMIN_PAGE || isAuthAPI) {
      const redirectUrl = new URL(LOGIN, nextUrl);
      redirectUrl.searchParams.set('callbackUrl', nextUrl.pathname);
      return Response.redirect(redirectUrl);
    }
    // 其他页面未登录也跳到登录页
    const redirectUrl = new URL(LOGIN, nextUrl);
    redirectUrl.searchParams.set('callbackUrl', nextUrl.pathname);
    return Response.redirect(redirectUrl);
  }

  // 已登录的情况
  if (role === 'admin') {
    return;
  }

  if (role === 'user') {
    if (isAPI_ADMIN || isADMIN_PAGE) {
      const redirectUrl = new URL(LOGIN, nextUrl);
      redirectUrl.searchParams.set('callbackUrl', ROOT); // 跳首页
      return Response.redirect(redirectUrl);
    }
  }

  // 其他角色或者异常情况
  return;
})

// 静态拦截匹配规则
export const config = {
  matcher: [
    "/((?!_next|favicon.ico).*)",
  ],
};
