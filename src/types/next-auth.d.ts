import 'next-auth';

type UserRole = 'admin' | 'scorer' | 'viewer';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
  }

  interface Session {
    user: User & {
      id: string;
      role: UserRole;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
  }
}
