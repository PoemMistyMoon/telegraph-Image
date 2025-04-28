import { auth } from "@/auth"

const ROOT = '/';
const PUBLIC_ROUTES = ['/'];
const DEFAULT_REDIRECT = '/login';
const LOGIN = '/login';
const API_ADMIN = "/api/admin";
const ADMIN_PAGE = "/admin";
const AUTH_API = "/api/enableauthapi";
const enableAuthapi = process.env.ENABLE_AUTH_API === 'true';

export default auth(async (req) => {
    const { nextUrl } = req;
    const role = req?.auth?.user?.role;
    const isAuthenticated = !!req.auth;

    const isRoot = nextUrl.pathname === ROOT; // 检查是否是根目录
    const isAPI_ADMIN = nextUrl.pathname.startsWith(API_ADMIN);
    const isADMIN_PAGE = nextUrl.pathname.startsWith(ADMIN_PAGE);
    const isAuthAPI = nextUrl.pathname.startsWith(AUTH_API);

    // 1. 根目录需要认证
    if (isRoot && !isAuthenticated) {
        return Response.redirect(new URL(LOGIN, nextUrl));
    }

    // 2. 认证检查：未认证的情况
    if (!isAuthenticated) {
        if (isAPI_ADMIN) {
            return Response.json(
                { status: "fail", message: "You are not logged in by admin!", success: false },
                { status: 401 }
            );
        } else if (isADMIN_PAGE) {
            return Response.redirect(new URL(LOGIN, nextUrl)); // 重定向到登录页
        } else if (isAuthAPI) {
            if (enableAuthapi) {
                return Response.json(
                    { status: "fail", message: "You are not logged in by user!", success: false },
                    { status: 401 }
                );
            }
            // 不做认证检查，继续执行
            else {
                return;
            }
        } else {
            return;
        }
    }

    // 3. 用户认证通过后的角色检查
    if (role === 'admin') {
        return; // 允许 admin 访问
    }

    if (role === 'user') {
        if (isAPI_ADMIN || isADMIN_PAGE) {
            return Response.redirect(new URL(LOGIN, nextUrl)); // 如果是普通用户，访问 admin 路径会被重定向到登录
        }
    }
});

// 使用静态 matcher 配置
export const config = {
    matcher: [
        "/admin/:path*",
        "/api/admin/:path*",
        "/api/enableauthapi/:path*"
    ],
};
