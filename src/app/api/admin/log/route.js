import { NextResponse } from "next/server";
import { headers } from 'next/headers'
import { getRequestContext } from '@cloudflare/next-on-pages';

// 定义 CORS 头
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400', // 24小时
  'Content-Type': 'application/json'
};

export const runtime = 'edge';

export async function POST(request) {
  // 获取客户端的请求上下文
  const { env, cf, ctx } = getRequestContext();
  
  try {
    let { page, query } = await request.json();

    // 如果提供了查询参数
    if (query) {
      const ps = env.IMG.prepare(`
        SELECT tgimglog.id, tgimglog.url, tgimglog.referer, tgimglog.ip, tgimglog.time, imginfo.rating, imginfo.total
        FROM tgimglog
        JOIN imginfo ON tgimglog.url = imginfo.url
        WHERE tgimglog.url LIKE '%${query}%'
        ORDER BY tgimglog.id DESC
        LIMIT 10 OFFSET ${page} * 10
      `);
      const { results } = await ps.all();
      const total = await env.IMG.prepare(`
        SELECT COUNT(*) as total
        FROM tgimglog
        WHERE url LIKE '%${query}%'
      `).first();

      return Response.json({
        "code": 200,
        "success": true,
        "message": "success",
        "data": results,
        "page": page,
        "total": total.total
      });
    } else {
      // 如果没有提供查询参数，返回所有数据
      const ps = env.IMG.prepare(`
        SELECT tgimglog.id, tgimglog.url, tgimglog.referer, tgimglog.ip, tgimglog.time, imginfo.rating, imginfo.total
        FROM tgimglog
        JOIN imginfo ON tgimglog.url = imginfo.url
        ORDER BY tgimglog.id DESC
        LIMIT 10 OFFSET ${page} * 10
      `);
      const { results } = await ps.all();
      const total = await env.IMG.prepare(`
        SELECT COUNT(*) as total
        FROM tgimglog
      `).first();

      return Response.json({
        "code": 200,
        "success": true,
        "message": "success",
        "data": results,
        "page": page,
        "total": total.total
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
