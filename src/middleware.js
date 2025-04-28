import { auth } from "@/auth"

const ROOT = '/';
const PUBLIC_ROUTES = ['/'];
const DEFAULT_REDIRECT = '/login';
const LOGIN = '/login';
const API_CFILE = "/api/cfile"; // 需要忽略认证的路径
const AUTH_API = "/api/enableauthapi";
const enableAuthapi = process.env.ENABLE_AUTH_API === 'true';

export default auth(async (req) => {
    const { nextUrl } = req;
    const role = req?.auth?.user?.role;
    const isAuthenticated = !!req.auth;
    const isRoot = nextUrl.pathname === ROOT;
    const isCfileAPI = nextUrl.pathname.startsWith(API_CFILE); // 判断是否是 /api/cfile/* 路径

    // 1. 访问根目录且未认证，返回未认证
    if (isRoot && !isAuthenticated) {
        return Response.json(
            { status: "fail", message: "You are not authenticated!", success: false },
            { status: 401 }
        );
    }

    // 2. 如果是访问 /api/cfile/* 路径，跳过认证检查
    if (isCfileAPI) {
        return;
    }

    // 3. 其他认证逻辑保持不变
    if (!isAuthenticated) {
        if (nextUrl.pathname.startsWith("/api/admin")) {
            return Response.json(
                { status: "fail", message: "You are not logged in by admin!", success: false },
                { status: 401 },
            );
        }
        else if (nextUrl.pathname.startsWith("/admin")) {
            return Response.redirect(new URL(LOGIN, nextUrl));
        }
        else if (nextUrl.pathname.startsWith(AUTH_API)) {
            if (enableAuthapi) {
                return Response.json(
                    { status: "fail", message: "You are not logged in by user!", success: false },
                    { status: 401 }
                );
            }
            else {
                return;
            }
        }
        else {
            return;
        }
    }

    if (role === 'admin') {
        return;
    }

    if (role === 'user') {
        if (nextUrl.pathname.startsWith("/api/admin") || nextUrl.pathname.startsWith("/admin")) {
            return Response.redirect(new URL(LOGIN, nextUrl));
        }
    }
});

// 使用静态 matcher 配置
export const config = {
    matcher: [
        "/admin/:path*",
        "/api/admin/:path*",
        "/api/cfile/:path*", // 允许 /api/cfile/* 路径访问
    ],
};
