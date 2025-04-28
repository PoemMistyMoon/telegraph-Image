import { auth } from "@/auth";

const ROOT = '/';
const LOGIN = '/login';
const API_CFILE = "/api/cfile"; // 不需要认证的路径
const API_ADMIN = "/api/admin"; // 需要认证的路径
const ADMIN_PAGE = "/admin"; // 需要认证的路径
const enableAuthapi = process.env.ENABLE_AUTH_API === 'true';

export default auth(async (req) => {
    const { nextUrl } = req;
    const role = req?.auth?.user?.role;
    const isAuthenticated = !!req.auth;

    // 判断当前请求是否是需要认证的路径
    const isAPI_CFILE = nextUrl.pathname.startsWith(API_CFILE); // /api/cfile/* 不需要认证
    const isAPI_ADMIN = nextUrl.pathname.startsWith(API_ADMIN); // /api/admin/* 需要认证
    const isADMIN_PAGE = nextUrl.pathname.startsWith(ADMIN_PAGE); // /admin/* 需要认证

    // 如果启用了认证 API（ENABLE_AUTH_API=true），并且路径是需要认证的
    if (enableAuthapi && !isAPI_CFILE && !isAuthenticated) {
        // 未认证时，重定向到登录页
        return Response.redirect(new URL(LOGIN, nextUrl));
    }

    // 如果用户未认证，并且访问的是 /api/admin 或 /admin 等路径
    if (!isAuthenticated) {
        if (isAPI_ADMIN || isADMIN_PAGE) {
            return Response.redirect(new URL(LOGIN, nextUrl)); // 未认证，跳转到登录页面
        }
    }

    // 认证成功后的角色判断（如果需要）
    if (role === 'admin') {
        return; // admin 用户可以继续访问
    }

    if (role === 'user') {
        // 如果是普通用户，不能访问 admin 页或者 admin API，跳转到登录
        if (isAPI_ADMIN || isADMIN_PAGE) {
            return Response.redirect(new URL(LOGIN, nextUrl));
        }
    }
});

// 使用静态 matcher 配置
export const config = {
    matcher: [
        "/admin/:path*",
        "/api/admin/:path*",
        "/api/cfile/:path*",  // 这个路径不需要认证
    ],
};
