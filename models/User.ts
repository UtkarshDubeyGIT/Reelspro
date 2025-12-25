import mongoose , {Schema, model, models }from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser{
    email: string;
    password: string;
    username?: string; // unique, required for new users
    displayName?: string;
    avatar?: string;
    bio?: string;
    followers?: mongoose.Types.ObjectId[];
    following?: mongoose.Types.ObjectId[];
    _id?: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?:Date;
} 

const userSchema = new Schema<IUser>(
    {
        email:{ 
            type: String,
            required:true,
            unique:true
        },
        password:{ 
            type:String,
            required:true
        },
        username: {
            type: String,
            unique: true,
            sparse: true, // allows null values but enforces uniqueness when present
            trim: true,
            lowercase: true,
            match: [/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores"]
        },
        displayName: {
            type: String,
            trim: true,
            maxlength: 50
        },
        avatar: {
            type: String,
            trim: true
        },
        bio: {
            type: String,
            trim: true,
            maxlength: 200
        },
        followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
        following: [{ type: Schema.Types.ObjectId, ref: "User" }],
    },
    {
        timestamps:true
    }
);

userSchema.pre("save", async function (next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,10)
    }
    next()
});

const User = models?.User || model<IUser>("User", userSchema);


export default User;