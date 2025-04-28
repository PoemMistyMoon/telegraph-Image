import { auth } from "@/auth";

const LOGIN = '/login';
const API_CFILE = "/api/cfile"; 
const enableAuthapi = process.env.ENABLE_AUTH_API === 'true';

export default auth(async (req) => {
    const { nextUrl } = req;
    const role = req?.auth?.user?.role;
    const isAuthenticated = !!req.auth;

    const pathname = nextUrl.pathname;

    const isLoginPage = pathname === LOGIN;
    const isAPI_CFILE = pathname.startsWith(API_CFILE);

    if (enableAuthapi) {
        if (!isAPI_CFILE && !isLoginPage && !isAuthenticated) {
            // 未认证且不是 /api/cfile 或 /login 的请求，跳转到登录
            return Response.redirect(new URL(LOGIN, nextUrl));
        }
    }

    if (!isAuthenticated && !isLoginPage) {
        // 备用保护
        return Response.redirect(new URL(LOGIN, nextUrl));
    }

    // 认证成功后的角色控制
    if (role === 'user') {
        if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
            return Response.redirect(new URL(LOGIN, nextUrl));
        }
    }

    return;
});

// 使用静态 matcher 配置
export const config = {
    matcher: [
        "/((?!api/cfile/).*)",
    ],
};
