import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, updateDoc, arrayUnion, arrayRemove, increment, getDoc } from "firebase/firestore";

export async function POST(request: NextRequest) {
  try {
    const { researchId, userId } = await request.json();

    if (!researchId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const docRef = doc(db, "research_requests", researchId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: "Research not found" },
        { status: 404 }
      );
    }

    const data = docSnap.data();
    const starredBy = data.starredBy || [];
    const isStarred = starredBy.includes(userId);

    // Toggle star
    if (isStarred) {
      // Remove star
      await updateDoc(docRef, {
        stars: increment(-1),
        starredBy: arrayRemove(userId),
      });
    } else {
      // Add star
      await updateDoc(docRef, {
        stars: increment(1),
        starredBy: arrayUnion(userId),
      });
    }

    return NextResponse.json({ success: true, isStarred: !isStarred });
  } catch (error: any) {
    console.error("Star API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to star research" },
      { status: 500 }
    );
  }
}
