import { connectToDatabase } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import Video, { IVideo } from "@/models/Video";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    const videos = await Video.find({})
      .populate({
        path: "author",
        select: "username displayName avatar email"
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .lean();

    const total = await Video.countDocuments();

    return NextResponse.json(
      {
        videos: videos ?? [],
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get videos error:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const body: IVideo = await request.json();

    if (
      !body.title ||
      !body.description ||
      !body.videoUrl ||
      !body.thumbnailUrl ||
      !body.duration
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate duration (max 60 seconds)
    if (body.duration > 60) {
      return NextResponse.json(
        { error: "Video duration must be 60 seconds or less" },
        { status: 400 }
      );
    }

    // Validate aspect ratio (must be 9:16)
    if (body.aspectRatio && body.aspectRatio !== "9:16") {
      return NextResponse.json(
        { error: "Video aspect ratio must be 9:16" },
        { status: 400 }
      );
    }

    // Get user ID from session
    const User = (await import("@/models/User")).default;
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const videoData = {
      ...body,
      controls: body.controls ?? true,
      duration: body.duration,
      aspectRatio: body.aspectRatio || "9:16",
      author: user._id,
      likes: 0,
      shares: 0,
      likedBy: [],
      transformation: body.transformation
        ? {
            height: body.transformation.height,
            width: body.transformation.width,
            quality: body.transformation.quality ?? 100,
          }
        : undefined,
    };

    const newVideo = await Video.create(videoData);
    const populatedVideo = await Video.findById(newVideo._id)
      .populate({
        path: "author",
        select: "username displayName avatar email"
      })
      .lean();

    return NextResponse.json(populatedVideo, { status: 201 });
  } catch (error) {
    console.error("Create video error:", error);
    return NextResponse.json(
      { error: "Failed to create a video" },
      { status: 500 }
    );
  }
}
