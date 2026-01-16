import type { NextAuthConfig } from 'next-auth';

// Configuration de base sans Prisma (pour Edge Runtime/Middleware)
export const authConfig: NextAuthConfig = {
  providers: [], // Les providers sont ajoutes dans auth.ts
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isLoginPage = nextUrl.pathname === '/login';
      const isRegisterPage = nextUrl.pathname === '/register';
      const isAuthPage = isLoginPage || isRegisterPage;

      // Si sur page auth et connecte -> rediriger vers dashboard
      if (isAuthPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL('/', nextUrl));
        }
        return true; // Autoriser l'acces aux pages login/register
      }

      // Si pas connecte -> rediriger vers login
      if (!isLoggedIn) {
        const loginUrl = new URL('/login', nextUrl);
        loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
        return Response.redirect(loginUrl);
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'admin' | 'scorer' | 'viewer';
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
};
