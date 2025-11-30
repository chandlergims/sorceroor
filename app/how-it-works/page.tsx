"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">About Source</h1>
        
        <div className="space-y-8">
          {/* What is Source */}
          <section className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">What is Source?</h2>
            <p className="text-gray-700 leading-relaxed">
              Source is an AI-powered research platform that allows anyone to submit research queries and receive comprehensive, AI-generated reports. Each completed research task is publicly viewable, creating a growing knowledge base accessible to everyone.
            </p>
          </section>

          {/* How Creator Fees Work */}
          <section className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">How Creator Fees Work</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Unlike other tokenized projects, Source operates with real utility and sustainability in mind. Here's how our economic model works:
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="text-gray-900 font-medium">💰</span>
                <span><strong>Reinvestment:</strong> Creator fees are automatically reinvested to purchase API credits, ensuring the platform remains operational.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-gray-900 font-medium">📈</span>
                <span><strong>Scaling Formula:</strong> The more creator fees accumulated, the higher the daily request limits. More fees = more capacity for everyone.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-gray-900 font-medium">🔄</span>
                <span><strong>Sustainable Growth:</strong> As the platform grows, so does its capability to serve more users with more requests.</span>
              </li>
            </ul>
          </section>

          {/* Daily Request Limits */}
          <section className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Daily Request Limits</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Each user currently has a daily request limit to ensure fair access. As creator fees grow, this limit increases for everyone based on our scaling formula:
            </p>
            <div className="bg-gray-50 rounded p-4 font-mono text-sm text-gray-700">
              Daily Limit = base_limit + (creator_fees × scaling_factor)
            </div>
            <p className="text-gray-700 leading-relaxed mt-4">
              The bigger the creator fee pool, the better the experience for all users.
            </p>
          </section>

          {/* Inspiration */}
          <section className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Our Inspiration</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Source was inspired by <a href="https://x.com/yoheinakajima" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">@yoheinakajima</a>'s innovative work on <a href="https://x.com/askresearchoor" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">@askresearchoor</a>. While his project demonstrated the power of AI-driven research, we noticed an opportunity:
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="text-gray-900 font-medium">⚡</span>
                <span><strong>Real Utility:</strong> While others tokenized similar concepts without reinvestment or actual use cases, Source is built to be actively used and to sustain itself.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-gray-900 font-medium">🔨</span>
                <span><strong>Always Functional:</strong> We're building something that can always be used, not just speculated on. Every fee goes back into making the platform better.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-gray-900 font-medium">🌱</span>
                <span><strong>Community Growth:</strong> As more people use Source and contribute fees, everyone benefits from increased capacity and capabilities.</span>
              </li>
            </ul>
          </section>

          {/* The Vision */}
          <section className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">The Vision</h2>
            <p className="text-gray-700 leading-relaxed">
              Source aims to be a self-sustaining, community-driven research platform where value flows back into functionality. No empty promises, no speculation—just a tool that gets better as more people use it. The more creator fees we accumulate, the more research capacity we can provide, creating a positive feedback loop that benefits everyone.
            </p>
          </section>

          {/* Built By */}
          <section className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Built By</h2>
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
              className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
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
