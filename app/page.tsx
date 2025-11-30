"use client";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot, doc } from "firebase/firestore";
import { ResearchRequest } from "@/types/research";
import Link from "next/link";
import { Sparkle, Star } from "@phosphor-icons/react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function Home() {
  const router = useRouter();
  const { user, authenticated, ready } = usePrivy();
  const [completedResearch, setCompletedResearch] = useState<ResearchRequest[]>([]);
  const [showNewResearch, setShowNewResearch] = useState(false);
  const [newQuery, setNewQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentResearchId, setCurrentResearchId] = useState<string | null>(null);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState("");
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [totalCredits, setTotalCredits] = useState(0);
  const [dailyRequests, setDailyRequests] = useState(0);
  const [showLimitError, setShowLimitError] = useState(false);
  const [costHistory, setCostHistory] = useState<{time: string, cost: number}[]>([]);
  const [taskHistory, setTaskHistory] = useState<{time: string, count: number}[]>([]);
  const [chartType, setChartType] = useState<'cost' | 'tasks'>('cost');

  // Real-time listener for completed research only
  useEffect(() => {
    const q = query(
      collection(db, "research_requests"),
      orderBy("timestamp", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedResearch: ResearchRequest[] = [];
      const tagCount: { [key: string]: number } = {};
      let credits = 0;
      let todayRequests = 0;
      const today = new Date().toDateString();
      const history: {time: string, cost: number}[] = [];
      
      snapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() } as ResearchRequest;
        
        // Only show completed research
        if (data.status === "completed") {
          updatedResearch.push(data);
          
          // Add to total credits (only from completed)
          if (data.cost?.totalCost) {
            credits += data.cost.totalCost;
            
            // Add to history with timestamp
            const timestamp = new Date(data.timestamp);
            const timeLabel = timestamp.toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            });
            history.push({
              time: timeLabel,
              cost: data.cost.totalCost
            });
          }
          
          // Count tags
          if (data.tags) {
            data.tags.forEach((tag) => {
              tagCount[tag] = (tagCount[tag] || 0) + 1;
            });
          }
        }

        // Count today's requests for current user
        if (authenticated && user && data.userId === user.id) {
          const requestDate = new Date(data.timestamp).toDateString();
          if (requestDate === today) {
            todayRequests++;
          }
        }
      });
      
      setCompletedResearch(updatedResearch);
      setTotalCredits(credits);
      setDailyRequests(todayRequests);
      
      // Sort by timestamp and take last 15 points
      setCostHistory(history.reverse().slice(-15));
      
      // Create task count history (aggregate by time)
      const taskCountMap: { [time: string]: number } = {};
      history.forEach((item) => {
        if (taskCountMap[item.time]) {
          taskCountMap[item.time]++;
        } else {
          taskCountMap[item.time] = 1;
        }
      });
      
      const taskCountHistory: {time: string, count: number}[] = Object.entries(taskCountMap).map(([time, count]) => ({
        time,
        count
      }));
      setTaskHistory(taskCountHistory.slice(-15));
      
      // Get top 8 most popular tags
      const sortedTags = Object.entries(tagCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8)
        .map(([tag]) => tag);
      setPopularTags(sortedTags);
    });

    return () => unsubscribe();
  }, [authenticated, user]);

  const startResearch = async () => {
    if (!newQuery.trim() || !authenticated || !user) return;
    
    // Check if daily limit reached - show error instead of submitting
    if (dailyRequests >= 5) {
      setShowLimitError(true);
      return;
    }

    setLoading(true);
    setShowLimitError(false);

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: newQuery,
          userId: user.id,
          username: user.twitter?.username || "Unknown",
        }),
      });

      const data = await response.json();
      
      if (response.status === 429) {
        // Daily limit reached - show error
        setShowLimitError(true);
        setLoading(false);
        return;
      }
      
      if (response.ok && data.id) {
        setCurrentResearchId(data.id);
        setShowNewResearch(false);
        setNewQuery("");
      } else {
        console.error("Research error:", data.error);
        setLoading(false);
      }
    } catch (error) {
      console.error("Failed to start research:", error);
      setLoading(false);
    }
  };

  // Listen to current research progress
  useEffect(() => {
    if (!currentResearchId) return;

    const unsubscribe = onSnapshot(
      doc(db, "research_requests", currentResearchId),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setCurrentProgress(data.progress || 0);
          setCurrentStage(data.currentStage || "");
          
          // Redirect to research page when complete
          if (data.status === "completed") {
            router.push(`/research/${currentResearchId}`);
          }
        }
      }
    );

    return () => unsubscribe();
  }, [currentResearchId, router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const toggleStar = async (e: React.MouseEvent, researchId: string) => {
    e.preventDefault(); // Prevent navigation
    
    if (!authenticated || !user) return;

    try {
      await fetch("/api/star", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          researchId,
          userId: user.id,
        }),
      });
    } catch (error) {
      console.error("Failed to star:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      {/* Graph - Under Navbar */}
      {costHistory.length >= 1 && (
        <div className="w-full">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setChartType('cost')}
                  className={`text-xs font-medium transition-colors cursor-pointer ${
                    chartType === 'cost' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  COSTS
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => setChartType('tasks')}
                  className={`text-xs font-medium transition-colors cursor-pointer ${
                    chartType === 'tasks' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  TASKS
                </button>
              </div>
              <span className="text-xs text-gray-500">
                {chartType === 'cost' ? `Total: $${totalCredits.toFixed(5)}` : `Total: ${taskHistory.length} tasks`}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={chartType === 'cost' ? costHistory : taskHistory} margin={{ top: 5, right: 5, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 10, fill: '#6b7280' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#6b7280' }}
                  domain={[0, 'dataMax']}
                  tickCount={5}
                  tickFormatter={(value) => chartType === 'cost' ? `$${Number(value).toFixed(5)}` : Math.round(value).toString()}
                  width={75}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px',
                    padding: '8px'
                  }}
                  formatter={(value: number) => [
                    chartType === 'cost' ? `$${Number(value).toFixed(5)}` : `${value} tasks`,
                    chartType === 'cost' ? 'Cost' : 'Total Tasks'
                  ]}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey={chartType === 'cost' ? 'cost' : 'count'}
                  stroke="#1f2937" 
                  strokeWidth={2}
                  dot={{ fill: '#1f2937', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Popular Tags */}
        {popularTags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-medium text-gray-600 mb-3">POPULAR TAGS</h3>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`px-2.5 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                    selectedTag === tag
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ChatGPT-Style Search Bar */}
        {authenticated ? (
          <div className="mb-6">
            <div className="relative bg-white rounded-xl">
              <input
                type="text"
                value={newQuery}
                onChange={(e) => setNewQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    startResearch();
                  }
                }}
                placeholder="What would you like to research today?"
                className="w-full px-4 py-3 pr-12 bg-transparent rounded-xl focus:outline-none text-gray-900 text-sm"
                disabled={loading}
                maxLength={100}
              />
              <button
                onClick={startResearch}
                disabled={loading || !newQuery.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-900 hover:bg-gray-100 rounded-lg disabled:text-gray-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>
            
            {/* Daily Limit Error - Small red text */}
            {showLimitError && (
              <p className="text-xs text-red-600 mt-2">
                Daily limit reached. Please try again tomorrow.
              </p>
            )}
            
            {/* Loading Bar */}
            {loading && currentResearchId && (
              <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-gray-700 font-medium">{currentStage || "Initializing..."}</span>
                  <span className="text-gray-900 font-semibold">{currentProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-gray-800 to-gray-900 h-3 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${currentProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-2">Processing your research request...</p>
              </div>
            )}
          </div>
        ) : null}

        {/* Research List */}
        <div className="space-y-4">
          {completedResearch.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm">No research yet. Be the first to share!</p>
            </div>
          ) : (
            completedResearch
              .filter((research) => !selectedTag || research.tags?.includes(selectedTag))
              .slice(0, 20)
              .map((research) => (
              <Link
                key={research.id}
                href={`/research/${research.id}`}
                className="block bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow focus:outline-none"
              >
                {/* Header with Star */}
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-base font-semibold text-gray-900 flex-1 pr-3 leading-snug">
                    {research.title || research.query}
                  </h3>
                  <button
                    onClick={(e) => toggleStar(e, research.id)}
                    className="flex-shrink-0 mt-0.5 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      size={18}
                      weight={research.starredBy?.includes(user?.id || "") ? "fill" : "regular"}
                      className={research.starredBy?.includes(user?.id || "") ? "text-yellow-500" : "text-gray-400"}
                    />
                  </button>
                </div>

                {/* Content Preview */}
                {research.content && (
                  <p className="text-gray-700 text-sm mb-4 line-clamp-3 leading-relaxed">
                    {research.content}
                  </p>
                )}

                {/* Tags */}
                {research.tags && research.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {research.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="mb-4">
                    <span className="px-2.5 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                      N/A
                    </span>
                  </div>
                )}

                {/* Footer - Username and Stats */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="font-medium text-gray-700">@{research.username || "unknown"}</span>
                  <span>•</span>
                  <span>
                    {new Date(research.timestamp).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="ml-auto flex items-center gap-1">
                    <Star size={12} weight="fill" className="text-yellow-500" />
                    <span>{research.stars || 0}</span>
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
