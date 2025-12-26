import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextRequest } from 'next/server';

const handler = NextAuth(authOptions);

// #region agent log
async function wrappedHandler(req: NextRequest, context: any) {
  const url = req.url;
  const method = req.method;
  
  fetch('http://127.0.0.1:7243/ingest/dc8094a1-3080-4382-9ce1-ab0b69e272ba',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'nextauth-route:entry',message:'NextAuth handler entry',data:{url,method},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
  
  try {
    const response = await handler(req, context);
    
    fetch('http://127.0.0.1:7243/ingest/dc8094a1-3080-4382-9ce1-ab0b69e272ba',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'nextauth-route:success',message:'NextAuth handler success',data:{status:response?.status},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
    
    return response;
  } catch (error) {
    fetch('http://127.0.0.1:7243/ingest/dc8094a1-3080-4382-9ce1-ab0b69e272ba',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'nextauth-route:error',message:'NextAuth handler error',data:{error:String(error)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,B'})}).catch(()=>{});
    
    throw error;
  }
}
// #endregion

export { wrappedHandler as GET, wrappedHandler as POST };
