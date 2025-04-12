import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";

const users = new Map();

//User Auth
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "select_account"
        }
      }
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = users.get(credentials.email);
        if (!user) return null;
        
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;
        
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      return true;
    },
    async session({ session }: { session: Session }) {
      return session;
    },
    async jwt({ token }: { token: JWT }) {
      return token;
    },
    async redirect({ url, baseUrl }) {
      // Força o redirecionamento para o dashboard após o login bem-sucedido
      if (url === baseUrl || url.startsWith(`${baseUrl}/auth`)) {
        return `${baseUrl}/dashboard`;
      }
      return url;
    },
  },
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: "jwt" as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };