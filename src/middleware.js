import { auth } from "@/auth";

const ROOT = '/';
const LOGIN = '/login';
const API_ADMIN = "/api/admin";
const ADMIN_PAGE = "/admin";
const AUTH_API = "/api/enableauthapi";
const enableAuthapi = process.env.ENABLE_AUTH_API === 'true';
const REDIRECT_DOMAIN = process.env.REDIRECT_DOMAIN; // 新的环境变量，用于域名重定向

export default auth(async (req) => {
    const { nextUrl, headers } = req;
    const hostname = headers.get('host');

    // 重定向 logic：跳转到你的自定义域名
    if (hostname && hostname.endsWith('.pages.dev') && REDIRECT_DOMAIN) {
        const redirectUrl = new URL(nextUrl.href);
        redirectUrl.host = REDIRECT_DOMAIN;
        return Response.redirect(redirectUrl.toString(), 301);
    }

    // 身份验证逻辑（原封不动保留）
    const role = req?.auth?.user?.role;
    const isAuthenticated = !!req.auth;
    const isAPI_ADMIN = nextUrl.pathname.startsWith(API_ADMIN);
    const isADMIN_PAGE = nextUrl.pathname.startsWith(ADMIN_PAGE);
    const isAuthAPI = nextUrl.pathname.startsWith(AUTH_API);

    if (!isAuthenticated) {
        if (isAPI_ADMIN) {
            return Response.json(
                { status: "fail", message: "You are not logged in by admin!", success: false },
                { status: 401 },
            );
        } else if (isADMIN_PAGE) {
            return Response.redirect(new URL(LOGIN, nextUrl));
        } else if (isAuthAPI) {
            if (enableAuthapi) {
                return Response.json(
                    { status: "fail", message: "You are not logged in by user!", success: false },
                    { status: 401 }
                );
            } else {
                return;
            }
        } else {
            return;
        }
    }

    if (role === 'admin') return;
    if (role === 'user' && (isAPI_ADMIN || isADMIN_PAGE)) {
        return Response.redirect(new URL(LOGIN, nextUrl));
    }
});

export const config = {
    matcher: [
        "/admin/:path*",
        "/api/admin/:path*",
        "/api/enableauthapi/:path*"
    ],
};
