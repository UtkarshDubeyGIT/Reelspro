import { connectToDatabase } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import Video from "@/models/Video";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { id: videoId } = await params;
    const video = await Video.findById(videoId);

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Get user ID from session (we'll need to update auth to include user ID)
    // For now, using email as identifier - we'll need to fetch user
    const { connectToDatabase: connectDB } = await import("@/lib/db");
    await connectDB();
    const User = (await import("@/models/User")).default;
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = user._id;
    const likedBy = video.likedBy || [];
    const isLiked = likedBy.some(
      (id: any) => id.toString() === userId.toString()
    );

    if (isLiked) {
      // Unlike
      video.likedBy = likedBy.filter(
        (id: any) => id.toString() !== userId.toString()
      );
      video.likes = Math.max(0, (video.likes || 0) - 1);
    } else {
      // Like
      video.likedBy = [...likedBy, userId];
      video.likes = (video.likes || 0) + 1;
    }

    await video.save();

    return NextResponse.json({
      liked: !isLiked,
      likes: video.likes,
    });
  } catch (error) {
    console.error("Like error:", error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ liked: false });
    }

    await connectToDatabase();

    const { id: videoId } = await params;
    const video = await Video.findById(videoId);

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const User = (await import("@/models/User")).default;
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ liked: false });
    }

    const userId = user._id;
    const likedBy = video.likedBy || [];
    const isLiked = likedBy.some(
      (id: any) => id.toString() === userId.toString()
    );

    return NextResponse.json({ liked: isLiked });
  } catch (error) {
    console.error("Check like error:", error);
    return NextResponse.json({ liked: false });
  }
}

