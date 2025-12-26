'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { ReactNode, useEffect } from 'react';

export function SessionProvider({ children }: { children: ReactNode }) {
  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7243/ingest/dc8094a1-3080-4382-9ce1-ab0b69e272ba',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SessionProvider:mount',message:'SessionProvider mounted',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
  }, []);
  // #endregion
  
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
