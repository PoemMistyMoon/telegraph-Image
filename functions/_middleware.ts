export const onRequest: PagesFunction = async (context) => {
  const allowedHost = "img.nnvv.me"; // 替换为你的自定义域名

  const requestHost = context.request.headers.get("host");

  if (requestHost !== allowedHost) {
    return new Response("Access Denied", { status: 403 });
  }

  return await context.next();
};
