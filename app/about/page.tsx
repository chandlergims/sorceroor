"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";
import { CurrencyCircleDollar, ChartLineUp, ArrowsClockwise, Lightning, Hammer, Plant } from "@phosphor-icons/react";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <h1 className="text-xl font-bold text-gray-900 mb-6">About Source</h1>
        
        <div className="space-y-6 text-sm">
          {/* What is Source */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">What is Source?</h2>
            <p className="text-gray-700 leading-relaxed">
              Source is an AI-powered research platform that allows anyone to submit research queries and receive comprehensive, AI-generated reports. Each completed research task is publicly viewable, creating a growing knowledge base accessible to everyone.
            </p>
          </section>

          {/* How Creator Fees Work */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">How Creator Fees Work</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Unlike other tokenized projects, Source operates with real utility and sustainability in mind. Here's how our economic model works:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex gap-2 items-start">
                <CurrencyCircleDollar size={16} className="text-gray-900 mt-0.5 flex-shrink-0" weight="bold" />
                <span><strong>Reinvestment:</strong> Creator fees are automatically reinvested to purchase API credits, ensuring the platform remains operational.</span>
              </li>
              <li className="flex gap-2 items-start">
                <ChartLineUp size={16} className="text-gray-900 mt-0.5 flex-shrink-0" weight="bold" />
                <span><strong>Scaling Formula:</strong> The more creator fees accumulated, the higher the daily request limits. More fees = more capacity for everyone.</span>
              </li>
              <li className="flex gap-2 items-start">
                <ArrowsClockwise size={16} className="text-gray-900 mt-0.5 flex-shrink-0" weight="bold" />
                <span><strong>Sustainable Growth:</strong> As the platform grows, so does its capability to serve more users with more requests.</span>
              </li>
            </ul>
          </section>

          {/* Daily Request Limits */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">Daily Request Limits</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              Each user currently has a daily request limit to ensure fair access. As creator fees grow, this limit increases for everyone based on our scaling formula:
            </p>
            <div className="bg-gray-100 rounded p-3 font-mono text-xs text-gray-700">
              Daily Limit = base_limit + (creator_fees × scaling_factor)
            </div>
            <p className="text-gray-700 leading-relaxed mt-2">
              The bigger the creator fee pool, the better the experience for all users.
            </p>
          </section>

          {/* Our Mission */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We're building the best AI research platform. Initially supporting all research topics, Source will evolve into a specialized crypto research tool as we scale. Our focus is on continuous improvement through:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex gap-2 items-start">
                <Lightning size={16} className="text-gray-900 mt-0.5 flex-shrink-0" weight="bold" />
                <span><strong>Advanced Model Integration:</strong> Continuously integrating cutting-edge AI models (GPT-4, Claude, specialized crypto LLMs) to improve research quality and accuracy.</span>
              </li>
              <li className="flex gap-2 items-start">
                <Hammer size={16} className="text-gray-900 mt-0.5 flex-shrink-0" weight="bold" />
                <span><strong>Visual Data Representation:</strong> Transforming research into interactive charts, graphs, and visual insights for better comprehension.</span>
              </li>
              <li className="flex gap-2 items-start">
                <Plant size={16} className="text-gray-900 mt-0.5 flex-shrink-0" weight="bold" />
                <span><strong>Adaptive Learning:</strong> Our system learns which strategies work best for specific topics, continuously optimizing research quality.</span>
              </li>
            </ul>
          </section>

          {/* Research Pipeline */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">Research Pipeline</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Each research request flows through our multi-stage pipeline powered by OpenAI's API with web search capabilities:
            </p>
            <div className="space-y-2 text-xs text-gray-700">
              <div className="bg-gray-100 rounded p-2">
                <strong>1. Strategy Analysis:</strong> AI examines your topic and activates relevant search strategies optimized for entity discovery
              </div>
              <div className="bg-gray-100 rounded p-2">
                <strong>2. Query Generation:</strong> Creates 10-20 diverse search queries using activated strategies, prioritized by expected recall
              </div>
              <div className="bg-gray-100 rounded p-2">
                <strong>3. Web Search Cycle:</strong> Performs batched web searches, extracts entities in real-time with fingerprint blocking to prevent duplicates
              </div>
              <div className="bg-gray-100 rounded p-2">
                <strong>4. Enrichment:</strong> Enhances entities with additional data via targeted searches, tracking field provenance
              </div>
              <div className="bg-gray-100 rounded p-2">
                <strong>5. Content Generation:</strong> AI-generated summaries, semantic tags, and rich metadata for comprehensive reports
              </div>
            </div>
          </section>

          {/* Real-Time Technology */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">Real-Time Updates</h2>
            <p className="text-gray-700 leading-relaxed">
              Source uses Firebase WebSockets for instant, live updates across the platform. Research progress updates stream in real-time, new tasks appear instantly on your feed, and the live activity bar shows what others are researching—all without page refreshes. Cost tracking, task counts, and chart data update automatically as events occur.
            </p>
          </section>

          {/* Crypto Specialization */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">Crypto-Focused Evolution</h2>
            <p className="text-gray-700 leading-relaxed">
              As we fine-tune and scale, Source will specialize in crypto research with features like on-chain data analysis, DeFi protocol tracking, token metrics, market sentiment analysis, and real-time blockchain insights—creating the most comprehensive crypto research tool available.
            </p>
          </section>

          {/* Inspiration */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">Inspiration</h2>
            <p className="text-gray-700 leading-relaxed">
              Source was inspired by <a href="https://x.com/yoheinakajima" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">@yoheinakajima</a>'s <a href="https://x.com/askresearchoor" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">@askresearchoor</a>. While others tokenized similar concepts, we're building something meant to be used, improved, and sustained through actual utility.
            </p>
          </section>

          {/* The Vision */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">The Vision</h2>
            <p className="text-gray-700 leading-relaxed">
              Source aims to be a self-sustaining, community-driven research platform where value flows back into functionality. No empty promises, no speculation—just a tool that gets better as more people use it. The more creator fees we accumulate, the more research capacity we can provide, creating a positive feedback loop that benefits everyone.
            </p>
          </section>

          {/* Built By */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">Built By</h2>
            <p className="text-gray-700 leading-relaxed">
              Source is built and maintained by{" "}
              <a 
                href="https://x.com/theobuilding" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                @theobuilding
              </a>
              {" "}with a focus on creating sustainable, functional tools for the community.
            </p>
          </section>

          {/* CTA */}
          <div className="text-center pt-4">
            <Link 
              href="/"
              className="inline-block px-4 py-2 bg-gray-900 text-white text-xs rounded-lg hover:bg-gray-800 transition-colors"
            >
              Start Researching
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
