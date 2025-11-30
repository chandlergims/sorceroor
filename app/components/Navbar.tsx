"use client";

import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import Image from "next/image";
import { CaretDown, ClipboardText, SignOut } from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

export default function Navbar() {
  const { user, login, logout, authenticated } = usePrivy();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [totalTasks, setTotalTasks] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  const [dailyRequests, setDailyRequests] = useState(0);
  const [recentActivity, setRecentActivity] = useState<{username: string, query: string} | null>(null);

  // Listen to all research requests for stats and live activity
  useEffect(() => {
    const q = query(
      collection(db, "research_requests"),
      orderBy("timestamp", "desc")
    );

    let isInitialLoad = true;

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Detect new requests for live activity notification
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added" && !isInitialLoad) {
          const data = change.doc.data();
          // Show notification for new running requests (exclude own requests)
          if (data.status === "running" && (!user || data.userId !== user.id)) {
            setRecentActivity({
              username: data.username || "Someone",
              query: data.query
            });
            // Auto-dismiss after 5 seconds
            setTimeout(() => setRecentActivity(null), 5000);
          }
        }
      });
      let tasks = 0;
      let credits = 0;
      let todayRequests = 0;
      const today = new Date().toDateString();

      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Count completed tasks
        if (data.status === "completed") {
          tasks++;
          if (data.cost?.totalCost) {
            credits += data.cost.totalCost;
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

      setTotalTasks(tasks);
      setTotalCredits(credits);
      setDailyRequests(todayRequests);
      
      isInitialLoad = false;
    });

    return () => unsubscribe();
  }, [authenticated, user]);

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity cursor-pointer">
            <Image 
              src="/Arena (14).png" 
              alt="Source" 
              width={120} 
              height={40}
              className="object-contain"
            />
          </Link>
          
          {/* Stats in Center */}
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span>
              Tasks: <span className="font-semibold text-gray-900">{totalTasks}</span>
            </span>
            <span>•</span>
            <span>
              API Credits: <span className="font-semibold text-gray-900">${totalCredits.toFixed(4)}</span>
            </span>
            <span>•</span>
            <span>
              Creator Fees: <span className="font-semibold text-gray-900">$0.00</span>
            </span>
            <span>•</span>
            <span>
              Daily Requests: <span className="font-semibold text-gray-900">{dailyRequests}/5</span>
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            {authenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <span className="text-sm font-medium text-gray-900">@{user.twitter?.username || "user"}</span>
                  <CaretDown 
                    size={14} 
                    weight="bold" 
                    className={`text-gray-600 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} 
                  />
                </button>
                
                {dropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-2">
                      <Link
                        href="/tasks"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <ClipboardText size={18} />
                        <span>My Tasks</span>
                      </Link>
                      <div className="my-1 border-t border-gray-100" />
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <SignOut size={18} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={login}
                className="px-4 py-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors cursor-pointer text-sm font-medium text-gray-900"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
    
    {/* Live Activity Bar - Under Navbar */}
    {recentActivity && (
      <div className="w-full bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-300">
            <span className="font-medium text-white">@{recentActivity.username}</span>
            <span>started researching</span>
            <span className="italic truncate max-w-[300px] text-gray-400">"{recentActivity.query}"</span>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
