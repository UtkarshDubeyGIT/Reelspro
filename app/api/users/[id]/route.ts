import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Video from "@/models/Video";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { id: userId } = await params;

    // Try to find by ID first, then by username
    let user = await User.findById(userId).select("-password").lean();

    if (!user) {
      user = await User.findOne({ username: userId })
        .select("-password")
        .lean();
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Type assertion: findById/findOne return a single document, not an array
    const userDoc = Array.isArray(user) ? user[0] : user;
    if (!userDoc || !userDoc._id) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's videos
    const videos = await Video.find({ author: userDoc._id })
      .sort({ createdAt: -1 })
      .lean();

    // Get follower/following counts
    const followersCount = userDoc.followers?.length || 0;
    const followingCount = userDoc.following?.length || 0;
    const videosCount = videos.length;

    return NextResponse.json({
      ...userDoc,
      videos,
      stats: {
        videos: videosCount,
        followers: followersCount,
        following: followingCount,
      },
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}
