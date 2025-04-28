import { auth } from "@/auth";

const LOGIN = '/login';
const API_CFILE = "/api/cfile"; 
const enableAuthapi = process.env.ENABLE_AUTH_API === 'true';

export default auth(async (req) => {
    const { nextUrl } = req;
    const role = req?.auth?.user?.role;
    const isAuthenticated = !!req.auth;

    const isAPI_CFILE = nextUrl.pathname.startsWith(API_CFILE);

    if (enableAuthapi) {
        if (!isAPI_CFILE && !isAuthenticated) {
            // 未认证且不是/api/cfile时，跳转到登录
            return Response.redirect(new URL(LOGIN, nextUrl));
        }
    }

    if (!isAuthenticated) {
        // 备用保护（通常用不上，因为上面enableAuthapi已经处理了）
        return Response.redirect(new URL(LOGIN, nextUrl));
    }

    // 认证成功后的角色控制（比如普通用户限制访问后台）
    if (role === 'user') {
        if (nextUrl.pathname.startsWith("/admin") || nextUrl.pathname.startsWith("/api/admin")) {
            return Response.redirect(new URL(LOGIN, nextUrl));
        }
    }

    // 其他情况放行
    return;
});

// 使用静态 matcher 配置
export const config = {
    matcher: [
        "/((?!api/cfile/).*)",
    ],
};
