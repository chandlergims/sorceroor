import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, updateDoc, serverTimestamp, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { ResearchStage } from "@/types/research";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Pricing per 1K tokens for GPT-4o-mini
const PRICING = {
  prompt: 0.00015,
  completion: 0.0006,
};

// Helper function to update research progress
async function updateResearchProgress(
  docId: string,
  updates: any
) {
  const docRef = doc(db, "research_requests", docId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  let researchDocId: string | null = null;

  try {
    const { query: userQuery, userId, username } = await request.json();

    if (!userQuery || typeof userQuery !== "string") {
      return NextResponse.json(
        { error: "Invalid query provided" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User authentication required" },
        { status: 401 }
      );
    }

    // Check daily request limit (5 per day) - simplified to avoid composite index
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.toISOString();

    // Get all user requests and filter client-side (no orderBy to avoid composite index)
    const dailyCheckQuery = query(
      collection(db, "research_requests"),
      where("userId", "==", userId),
      limit(50)
    );

    const userSnapshot = await getDocs(dailyCheckQuery);
    let dailyCount = 0;
    
    userSnapshot.forEach((doc) => {
      const data = doc.data();
      const requestDate = new Date(data.timestamp);
      requestDate.setHours(0, 0, 0, 0);
      if (requestDate.toISOString() === todayTimestamp) {
        dailyCount++;
      }
    });

    if (dailyCount >= 5) {
      return NextResponse.json(
        { 
          error: "Daily request limit reached",
          message: "You have reached your daily limit of 5 requests. Please try again tomorrow."
        },
        { status: 429 }
      );
    }

    // Define research stages
    const stages: ResearchStage[] = [
      { name: "Analyzing Query", status: "pending" },
      { name: "Generating Research", status: "pending" },
      { name: "Finalizing Results", status: "pending" },
    ];

    // Create initial research document
    const docRef = await addDoc(collection(db, "research_requests"), {
      query: userQuery,
      userId,
      username: username || "Unknown",
      status: "running",
      timestamp: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stages,
      progress: 0,
      currentStage: "Initializing research pipeline...",
    });

    researchDocId = docRef.id;

    // Return ID immediately so user can watch progress
    // Continue processing asynchronously
    processResearch(researchDocId, userQuery, stages).catch(console.error);

    return NextResponse.json({
      success: true,
      id: researchDocId,
      message: "Research started successfully",
    });
  } catch (error: any) {
    console.error("Research API error:", error);

    return NextResponse.json(
      { error: error.message || "Failed to start research" },
      { status: 500 }
    );
  }
}

async function processResearch(
  researchDocId: string,
  query: string,
  stages: ResearchStage[]
) {
  try {
    // Stage 1: Analyzing Query
    stages[0].status = "in-progress";
    stages[0].timestamp = new Date().toISOString();
    
    // Smooth progress from 0 to 20
    for (let i = 5; i <= 20; i += 5) {
      await updateResearchProgress(researchDocId, {
        stages,
        progress: i,
        currentStage: "Analyzing your query...",
      });
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    // Stage 2: Generating Research
    stages[0].status = "completed";
    stages[1].status = "in-progress";
    stages[1].timestamp = new Date().toISOString();
    
    // Smooth progress from 20 to 40
    for (let i = 25; i <= 40; i += 5) {
      await updateResearchProgress(researchDocId, {
        stages,
        progress: i,
        currentStage: "Generating research content...",
      });
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    // Make the actual API call
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant in a research app.

- Provide comprehensive, well-structured research on legitimate topics
- Include key facts, recent developments, and relevant insights
- Present information objectively without referring to yourself or mentioning any AI systems

IMPORTANT RESTRICTIONS:
- Refuse to answer anything that is hateful, sexual involving minors, self-harm, or illegal instructions
- If the user asks for anything outside normal research topics, politely state you cannot help with that request and suggest focusing on legitimate research topics instead
- Do not provide instructions for dangerous, harmful, or illegal activities`,
        },
        {
          role: "user",
          content: query,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content || "";
    const usage = completion.usage;

    // Generate tags for the research
    const tagsCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Generate 3-5 concise, single-word or short category tags for this research topic. Examples: Technology, Business, AI, Science, Finance, Health, etc. Return ONLY comma-separated tags, no explanations.",
        },
        {
          role: "user",
          content: query,
        },
      ],
      temperature: 0.3,
      max_tokens: 30,
    });

    const tagsString = tagsCompletion.choices[0]?.message?.content || "";
    
    // Generate title for the research
    const titleCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Generate a concise, descriptive title (max 8 words) for this research query. Return ONLY the title, no quotes or explanations.",
        },
        {
          role: "user",
          content: query,
        },
      ],
      temperature: 0.5,
      max_tokens: 20,
    });

    const title = titleCompletion.choices[0]?.message?.content?.replace(/['"]/g, "").trim() || query;
    
    // Calculate costs first
    const promptTokens = usage?.prompt_tokens || 0;
    const completionTokens = usage?.completion_tokens || 0;
    const totalTokens = usage?.total_tokens || 0;
    const promptCost = (promptTokens / 1000) * PRICING.prompt;
    const completionCost = (completionTokens / 1000) * PRICING.completion;
    const totalCost = promptCost + completionCost;
    
    // Common generic filler tags to filter out
    const genericTags = [
      "technology", "ai", "science", "innovation", "research", 
      "general", "business", "education", "information", "knowledge",
      "development", "analysis", "study", "topic", "subject"
    ];
    
    const tags = tagsString
      .split(",")
      .map((tag) => tag.trim().replace(/['"]/g, ""))
      .filter((tag) => {
        const lowerTag = tag.toLowerCase();
        // Filter out empty tags, too long tags, and generic filler tags
        return tag.length > 0 && 
               tag.length < 25 && 
               !genericTags.includes(lowerTag);
      })
      .slice(0, 5);
    
    // Stage 3: Finalizing Results
    stages[1].status = "completed";
    stages[2].status = "in-progress";
    stages[2].timestamp = new Date().toISOString();
    
    // Smooth progress from 40 to 80
    for (let i = 45; i <= 80; i += 5) {
      await updateResearchProgress(researchDocId, {
        stages,
        progress: i,
        currentStage: "Finalizing results...",
      });
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    
    // If query is too short or vague, don't save generic tags
    if (query.trim().length < 3 || tags.length === 0) {
      // Don't save tags at all - will show "N/A" on frontend
      await updateResearchProgress(researchDocId, {
        stages,
        progress: 85,
        currentStage: "Finalizing results...",
        content,
        title,
        cost: {
          promptTokens,
          completionTokens,
          totalTokens,
          totalCost,
          promptCost,
          completionCost,
        },
      });
    } else {
      await updateResearchProgress(researchDocId, {
        stages,
        progress: 85,
        currentStage: "Finalizing results...",
        content,
        title,
        tags,
        cost: {
          promptTokens,
          completionTokens,
          totalTokens,
          totalCost,
          promptCost,
          completionCost,
        },
      });
    }

    // Smooth progress from 85 to 100
    for (let i = 90; i <= 100; i += 5) {
      await updateResearchProgress(researchDocId, {
        stages,
        progress: i,
        currentStage: i === 100 ? "Research completed" : "Finalizing results...",
      });
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    // Mark as completed
    stages[2].status = "completed";
    stages[2].timestamp = new Date().toISOString();
    await updateResearchProgress(researchDocId, {
      stages,
      status: "completed",
      progress: 100,
      currentStage: "Research completed",
    });

  } catch (error: any) {
    console.error("Research processing error:", error);

    try {
      await updateResearchProgress(researchDocId, {
        status: "failed",
        progress: 0,
        currentStage: `Error: ${error.message}`,
      });
    } catch (updateError) {
      console.error("Failed to update error status:", updateError);
    }
  }
}
