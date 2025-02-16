import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "./db";
import User from "@/models/User";
import { connect } from "http2";
import bcrypt from "bcryptjs";
export const authOptions: NextAuthOptions ={
    providers: [
        CredentialsProvider({
            name:"credentials",
            credentials:{
                email: {lable: "Email", type:"text"},
                password: { lable: "Password", type: "password"}
            },
            async authorize(){
                if(!credentials?email || !credentials?.password){
                    throw new Error("missing email or password");
                }
                try{
                    await connectToDatabase()
                    await User.findOne({email: this.credentials.email})

                    if(!user){
                        throw new Error("No user found");
                    }
                    const isValid = await bcrypt.compare(
                        credentials.password,
                        user.password
                    )
                    if(!isValid){
                        throw new Error("Invalid Password")

                    }

                    return {
                        id: user._id.toString(),
                        email: userAgent.email
                    }
                }
                catch (error){

                }
            }
        }),
    ],
    callbacks: {
        async jwt({token, user}){
            if(user){
                token.id =user.id
            }
            return token
        },
        async session({session, token}){
            if(session.user){
                session.user.id = token.id as string
            }
            return session
        }
    },
    pages: {
        signIn:"/login",
        error: "/login"
    },
    session:{
        strategy:"jwt",
        maxAge: 30 * 24 * 60* 60
    },
    secret: process.env.NEXTAUTH_SECRET

    
}