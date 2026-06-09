import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        // Lazy-initialize db inside callback to avoid module-level issues
        const { query, initDb } = await import('./db');
        try {
          await initDb();
        } catch {
          // Tables may already exist
        }
        const rows = await query('SELECT * FROM users WHERE email = ?', [credentials.email as string]);
        const user = rows[0] as any;
        if (!user) return null;
        const valid = await bcrypt.compare(credentials.password as string, user.password_hash as string);
        if (!valid) return null;
        return { id: String(user.id), email: user.email as string, role: user.role as string, name: user.email as string };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      return token;
    },
    session({ session, token }) {
      if (session.user) (session.user as any).role = token.role;
      return session;
    },
  },
  pages: { signIn: '/login' },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'store-scheduler-secret-key-change-in-production',
});
