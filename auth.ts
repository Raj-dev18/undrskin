import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Apple from "next-auth/providers/apple"

const googleId = process.env.AUTH_GOOGLE_ID;
const googleSecret = process.env.AUTH_GOOGLE_SECRET;

if (!googleId || googleId.includes("dummy") || googleId.length < 10) {
  console.error("❌ [Auth] Google OAuth Error: AUTH_GOOGLE_ID is missing or invalid in .env.local");
}
if (!googleSecret || googleSecret.includes("dummy") || googleSecret.length < 10) {
  console.error("❌ [Auth] Google OAuth Error: AUTH_GOOGLE_SECRET is missing or invalid in .env.local (Secret not exposed)");
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: googleId,
      clientSecret: googleSecret,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    Apple({
      clientId: process.env.AUTH_APPLE_ID,
      clientSecret: process.env.AUTH_APPLE_SECRET,
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAccount = nextUrl.pathname.startsWith('/account');
      if (isOnAccount) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }
      return true;
    },
  },
})
