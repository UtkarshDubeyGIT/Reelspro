import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth";
//import auth options from lib/auth
const handler =  NextAuth(authOptions);

export { handler as GET, handler as POST};

