"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { ResearchRequest } from "@/types/research";
import Link from "next/link";
import Navbar from "../components/Navbar";
import {
  ClipboardText,
  CheckCircle,
  XCircle,
  Circle,
  ArrowRight,
  Sparkle,
} from "@phosphor-icons/react";

export default function TasksPage() {
  const router = useRouter();
  const { user, login, authenticated, ready } = usePrivy();
  const [requests, setRequests] = useState<ResearchRequest[]>([]);
  const [stats, setStats] = useState({ total: 0, running: 0, completed: 0, failed: 0, totalCost: 0 });

  // Real-time listener for user's research requests only  
  useEffect(() => {
    if (!authenticated || !user) {
      setRequests([]);
      return;
    }

    const q = query(
      collection(db, "research_requests"),
      orderBy("timestamp", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedRequests: ResearchRequest[] = [];
      let running = 0,
        completed = 0,
        failed = 0;

      let totalCost = 0;
      
      snapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() } as ResearchRequest;
        // Filter by userId client-side to avoid composite index
        if (data.userId === user.id) {
          updatedRequests.push(data);

          if (data.status === "running") running++;
          else if (data.status === "completed") completed++;
          else if (data.status === "failed") failed++;
          
          if (data.cost?.totalCost) {
            totalCost += data.cost.totalCost;
          }
        }
      });

      setRequests(updatedRequests);
      setStats({
        total: updatedRequests.length,
        running,
        completed,
        failed,
        totalCost,
      });
    });

    return () => unsubscribe();
  }, [authenticated, user]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with inline stats */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
            <p className="text-sm text-gray-600 mt-1">
              {stats.total} tasks · ${stats.totalCost.toFixed(4)} total cost
            </p>
          </div>
        </div>

        {/* Task List */}
        {requests.length > 0 && (
          <div className="space-y-0">
            {requests.map((request, index) => (
              <div
                key={request.id}
                onClick={() => request.status === "completed" && router.push(`/research/${request.id}`)}
                className={`py-3 border-b border-gray-200 ${
                  request.status === "completed" 
                    ? "hover:bg-gray-50 cursor-pointer" 
                    : "cursor-default"
                } transition-colors`}
              >
                <div className="flex items-center gap-6">
                  <span className="text-xs text-gray-400 font-mono w-6 shrink-0">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="text-sm text-gray-900 flex-1 min-w-0 truncate">
                    {request.title || request.query}
                  </span>
                  <span className={`text-xs font-mono w-20 text-center shrink-0 ${
                    request.status === "running"
                      ? "text-blue-600"
                      : request.status === "completed"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}>
                    {request.status === "running" && request.progress ? `${request.progress}%` : request.status.toUpperCase()}
                  </span>
                  <span className="font-mono text-xs text-gray-600 w-24 text-right shrink-0">
                    {new Date(request.timestamp).toLocaleDateString("en-US", {
                      month: "2-digit",
                      day: "2-digit",
                      year: "numeric"
                    })}
                  </span>
                  <span className="font-mono text-xs text-gray-900 w-20 text-right shrink-0">
                    ${request.cost?.totalCost.toFixed(4) || "0.0000"}
                  </span>
                </div>
                {request.status === "running" && request.currentStage && (
                  <div className="text-xs text-gray-500 mt-1 ml-12 font-mono">
                    → {request.currentStage}
                  </div>
                )}
            </div>
          ))}
          </div>
        )}
      </main>
    </div>
  );
}
