"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { ResearchRequest } from "@/types/research";
import Navbar from "@/app/components/Navbar";
import { Star } from "@phosphor-icons/react";
import { usePrivy } from "@privy-io/react-auth";

export default function ResearchDetailPage() {
  const params = useParams();
  const { user } = usePrivy();
  const [research, setResearch] = useState<ResearchRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;

    const docRef = doc(db, "research_requests", params.id as string);
    
    const unsubscribe = onSnapshot(
      docRef,
      (doc) => {
        if (doc.exists()) {
          setResearch({ id: doc.id, ...doc.data() } as ResearchRequest);
        } else {
          setResearch(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching research:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [params.id]);

  const toggleStar = async () => {
    if (!user || !research) return;

    try {
      await fetch("/api/star", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          researchId: research.id,
          userId: user.id,
        }),
      });
    } catch (error) {
      console.error("Failed to star:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!research) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Research Not Found</h2>
            <p className="text-gray-600">The requested research could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
          {research.title || research.query}
        </h1>
        
        {/* Meta Info */}
        <div className="flex items-center gap-3 text-sm text-gray-600 mb-4">
          <span className="font-medium text-gray-900">@{research.username || "unknown"}</span>
          <span>•</span>
          <span>
            {new Date(research.timestamp).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span>•</span>
          <span className="text-gray-900 font-medium">${research.cost?.totalCost.toFixed(6) || "0.000000"}</span>
          <span>•</span>
          <span className="text-gray-900 font-medium">{research.cost?.totalTokens || 0} tokens</span>
        </div>

        {/* Tags */}
        {research.tags && research.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-gray-200">
            {research.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Article Content */}
        {research.content && (
          <article className="prose prose-gray max-w-none">
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {research.content}
            </div>
          </article>
        )}
      </main>
    </div>
  );
}
