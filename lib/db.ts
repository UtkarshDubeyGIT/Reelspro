import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URL as string;

if (!MONGODB_URI){
    throw new Error("Please define mongodb uri in env file");
}

let cached = global.mongoose;

if(!cached){
    cached = global.mongoose = {conn : null, promise: null };
}

export async function connectToDatabase() { 
    if(cached.conn){
        return cached.conn;
    };

    if(!cached.promise){
        // Set strictPopulate to false globally
        mongoose.set('strictPopulate', false);
        const opts ={
            bufferCommands: true,
            maxPoolSize: 10,
        };
        cached.promise = mongoose.connect(MONGODB_URI, opts).then(() => mongoose.connection);
    };

    try {
        cached.conn = await cached.promise
    } catch(error){
        cached.promise = null
        throw error
    };

    return cached.conn;
}