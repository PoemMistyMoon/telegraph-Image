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

    // 如果是访问 /login 页面，直接放行
    if (isLoginPage) return;

    if (enableAuthapi) {
        if (!isAPI_CFILE && !isAuthenticated) {
            // 如果启用了认证API，且不是访问 /api/cfile 路径，且未认证，跳转到登录页面
            return Response.redirect(new URL(LOGIN, nextUrl));
        }
    }

    // 如果用户是 admin，放行所有页面
    if (role === 'admin') {
        return;
    }

    // 如果用户是普通用户（user），且访问 /admin 或 /api/admin 页面，跳转到登录页面
    if (role === 'user' && (pathname.startsWith("/admin") || pathname.startsWith("/api/admin"))) {
        return Response.redirect(new URL(LOGIN, nextUrl));
    }

    // 如果未认证，跳转到登录页面
    if (!isAuthenticated) {
        return Response.redirect(new URL(LOGIN, nextUrl));
    }

    return;
});

// 使用静态 matcher 配置
export const config = {
    matcher: [
        "/((?!api/cfile/).*)", // 匹配所有路径，但排除 /api/cfile/*
    ],
};
