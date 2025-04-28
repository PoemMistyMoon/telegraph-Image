export const runtime = 'edge';
export async function POST(request) {
  const { page, query } = await request.json();

  try {
    if (query) {
      // 修改后的查询：在 imginfo 表的 url, referer, ip, rating, total, time 字段上进行模糊匹配
      const ps = env.IMG.prepare(`
        SELECT * FROM imginfo 
        WHERE url LIKE '%${query}%' 
           OR referer LIKE '%${query}%' 
           OR ip LIKE '%${query}%' 
           OR rating LIKE '%${query}%' 
           OR total LIKE '%${query}%' 
           OR time LIKE '%${query}%' 
        LIMIT 10 OFFSET ${page} * 10`);
      
      const { results } = await ps.all();
      const total = await env.IMG.prepare(`
        SELECT COUNT(*) as total FROM imginfo 
        WHERE url LIKE '%${query}%' 
           OR referer LIKE '%${query}%' 
           OR ip LIKE '%${query}%' 
           OR rating LIKE '%${query}%' 
           OR total LIKE '%${query}%' 
           OR time LIKE '%${query}%'`).first();

      return Response.json({
        "code": 200,
        "success": true,
        "message": "success",
        "data": results,
        "page": page,
        "total": total.total,
      });
    } else {
      const ps = env.IMG.prepare(`SELECT * FROM imginfo ORDER BY id DESC LIMIT 10 OFFSET ${page} * 10`);
      const { results } = await ps.all();
      const total = await env.IMG.prepare(`SELECT COUNT(*) as total FROM imginfo`).first();

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
