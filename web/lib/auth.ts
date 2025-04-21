import axios from "axios";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
// import { kMaxLength } from "buffer";

export const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }
        try {
          console.log(process.env.NEXT_PUBLIC_DJANGO_API_URL);
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_DJANGO_API_URL}/api/auth/`,
            {
              email: credentials.email,
              password: credentials.password,
            },
            {
              headers: { "Content-Type": "application/json" },
            },
          );

          const { user, access_token } = response.data;

          if (!user || !access_token) {
            throw new Error("Invalid email or password");
          }

          // Return the user data along with the access token
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            accessToken: access_token,
          };
        } catch (error) {
          throw new Error("Invalid email or password");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      console.log(session);
      console.log(token);
      if (token) {
        session.user.id = token.id;
        session.user.accessToken = token.accessToken; // Pass the access token to session
      }
      return session;
    },
  },
  pages: {
    signIn: "/api/auth/login",
  },
};
