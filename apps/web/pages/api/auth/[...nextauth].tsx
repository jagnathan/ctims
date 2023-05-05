import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
  // Configure one or more authentication providers
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    jwt: async ({token, user, account, profile, isNewUser}) => {
      // console.log('jwt', token, user, account, profile, isNewUser);
      if (user) {
        token.accessToken = user['accessToken'];
      }
      return token
    },
    session: async ({session, token, user}) => {
      // console.log('session', session, token, user);
      session['accessToken'] = token.accessToken
      return session
    }
  },
  providers: [CredentialsProvider({
    credentials: undefined,

    authorize: async  (credentials: any) => {
      // console.log('credentials', credentials, req);

      try {
        const response = await fetch('http://localhost:3333/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: credentials.username,
            password: credentials.password,
          }),
        });

        const data = await response.json();

        if (data.accessToken && data.user) {
          data.user.accessToken = data.accessToken;
          return data.user
        } else {
          throw new Error('Invalid credentials');
        }
      } catch (error) {
        throw new Error('Failed to authorize');
      }
    }
  })],
});