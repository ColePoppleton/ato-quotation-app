    import NextAuth from "next-auth"
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "./lib/db"

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: MongoDBAdapter(clientPromise),
    providers: [
        MicrosoftEntraID({
            clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
            clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
            tenantId: process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID,
        }),
    ],
    callbacks: {
        async session({ session, user }) {
            session.user.role = user.role;
            return session;
        }
    }
})