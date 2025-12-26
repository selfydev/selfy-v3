import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// #region agent log
const hasSecret = !!process.env['NEXTAUTH_SECRET'];
fetch('http://127.0.0.1:7243/ingest/dc8094a1-3080-4382-9ce1-ab0b69e272ba',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.ts:module-load',message:'Auth module loaded',data:{hasSecret,nodeEnv:process.env['NODE_ENV']},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
// #endregion

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Credentials Provider (Email/Password)
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });
        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }
        const isCorrectPassword = await bcrypt.compare(credentials.password, user.password);
        if (!isCorrectPassword) {
          throw new Error('Invalid credentials');
        }
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
    // Google OAuth Provider (Optional)
    ...(process.env['GOOGLE_CLIENT_ID'] && process.env['GOOGLE_CLIENT_SECRET']
      ? [
          GoogleProvider({
            clientId: process.env['GOOGLE_CLIENT_ID'],
            clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
          }),
        ]
      : []),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/dc8094a1-3080-4382-9ce1-ab0b69e272ba',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.ts:jwt-entry',message:'JWT callback entry',data:{hasUser:!!user,trigger,tokenId:token['id']},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,C'})}).catch(()=>{});
      // #endregion
      try {
        if (user) {
          token['id'] = user.id;
          token['role'] = user.role;
        } else if (trigger === 'update' || !token['role']) {
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/dc8094a1-3080-4382-9ce1-ab0b69e272ba',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.ts:jwt-db-fetch',message:'Fetching user from DB',data:{tokenId:token['id']},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B,C'})}).catch(()=>{});
          // #endregion
          // Fetch fresh user data from database if role is missing
          const dbUser = await prisma.user.findUnique({
            where: { id: token['id'] as string },
            select: { role: true },
          });
          if (dbUser) {
            token['role'] = dbUser.role;
          }
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/dc8094a1-3080-4382-9ce1-ab0b69e272ba',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.ts:jwt-db-result',message:'DB fetch result',data:{foundUser:!!dbUser,role:dbUser?.role},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B,C'})}).catch(()=>{});
          // #endregion
        }
        return token;
      } catch (error) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/dc8094a1-3080-4382-9ce1-ab0b69e272ba',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.ts:jwt-error',message:'JWT callback error',data:{error:String(error)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,B,C'})}).catch(()=>{});
        // #endregion
        throw error;
      }
    },
    async session({ session, token }) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/dc8094a1-3080-4382-9ce1-ab0b69e272ba',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.ts:session-entry',message:'Session callback entry',data:{hasSession:!!session,tokenRole:token['role']},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,C'})}).catch(()=>{});
      // #endregion
      if (session.user) {
        session.user.id = token['id'] as string;
        session.user.role = token['role'] as any;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
