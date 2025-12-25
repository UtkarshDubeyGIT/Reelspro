import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date();
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24); // 24 hours from now

    // Create user with emailVerified: false
    await User.create({
      email,
      password,
      emailVerified: false,
      verificationToken,
      verificationTokenExpiry,
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError: unknown) {
      console.error("Failed to send verification email:", emailError);
      
      // If it's a Resend validation error, return a more helpful error
      const errorMessage = emailError instanceof Error ? emailError.message : String(emailError);
      if (errorMessage.includes("Resend API Error")) {
        return NextResponse.json(
          { 
            error: "Failed to send verification email. Please check your Resend configuration.",
            details: errorMessage,
            verificationToken: process.env.NODE_ENV === "development" ? verificationToken : undefined, // Only expose token in dev
            verificationUrl: process.env.NODE_ENV === "development" 
              ? `${process.env.APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"}/verify-email?token=${verificationToken}`
              : undefined
          },
          { status: 500 }
        );
      }
      
      // For other errors, still create the user but log the error
      // In production, you might want to handle this differently
      console.warn("User created but verification email failed to send. Token:", verificationToken);
    }

    return NextResponse.json(
      { 
        message: "User registered successfully. Please check your email to verify your account.",
        requiresVerification: true
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
}
