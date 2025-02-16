declare module "next-auth" {
    interface Session{
        user:{
            id: string;
        }& DefaultSession["User"];
    }
}