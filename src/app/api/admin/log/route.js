export async function POST(request) {
  const { page, query } = await request.json();

  try {
    if (query) {
      // 修改后的查询：在 tgimglog 和 imginfo 表的 url, referer, ip, time, rating, total 字段上进行模糊匹配
      const ps = env.IMG.prepare(`
        SELECT tgimglog.*, imginfo.rating, imginfo.total 
        FROM tgimglog 
        JOIN imginfo ON tgimglog.url = imginfo.url 
        WHERE tgimglog.url LIKE '%${query}%' 
           OR tgimglog.referer LIKE '%${query}%' 
           OR tgimglog.ip LIKE '%${query}%' 
           OR tgimglog.time LIKE '%${query}%' 
           OR imginfo.rating LIKE '%${query}%' 
           OR imginfo.total LIKE '%${query}%' 
           OR imginfo.time LIKE '%${query}%' 
        ORDER BY tgimglog.id DESC 
        LIMIT 10 OFFSET ${page} * 10`);
      
      const { results } = await ps.all();
      const total = await env.IMG.prepare(`
        SELECT COUNT(*) as total 
        FROM tgimglog 
        JOIN imginfo ON tgimglog.url = imginfo.url 
        WHERE tgimglog.url LIKE '%${query}%' 
           OR tgimglog.referer LIKE '%${query}%' 
           OR tgimglog.ip LIKE '%${query}%' 
           OR tgimglog.time LIKE '%${query}%' 
           OR imginfo.rating LIKE '%${query}%' 
           OR imginfo.total LIKE '%${query}%' 
           OR imginfo.time LIKE '%${query}%'`).first();

      return Response.json({
        "code": 200,
        "success": true,
        "message": "success",
        "data": results,
        "page": page,
        "total": total.total,
      });
    } else {
      const ps = env.IMG.prepare(`
        SELECT tgimglog.*, imginfo.rating, imginfo.total 
        FROM tgimglog 
        JOIN imginfo ON tgimglog.url = imginfo.url 
        ORDER BY tgimglog.id DESC 
        LIMIT 10 OFFSET ${page} * 10`);
      const { results } = await ps.all();
      const total = await env.IMG.prepare(`SELECT COUNT(*) as total FROM tgimglog`).first();

      return Response.json({
        "code": 200,
        "success": true,
        "message": "success",
        "data": results,
        "page": page,
        "total": total.total,
      });
    }
  } catch (error) {
    return Response.json({
      "code": 500,
      "success": false,
      "message": error.message,
      "data": page,
    }, {
      status: 500,
      headers: corsHeaders,
    });
  }
}
