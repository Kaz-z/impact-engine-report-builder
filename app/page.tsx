"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, Clock, MessageSquare, CheckCircle } from "lucide-react"
import Header from "./components/Header"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navigation */}
      {/* <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-orange-500/80 to-orange-600/80 w-8 h-8 rounded-md flex items-center justify-center text-white font-bold">
              
            </div>
            <span className="font-semibold text-lg">Impact Engine</span>
          </div>
          <div className="flex items-center gap-4">
            <Button size="lg" onClick={() => window.location.href = '/login'} className="bg-orange-600/90 hover:bg-orange-700/90 text-white">Login</Button>
          </div>
        </div>
      </header> */}
      <Header />

      <main>
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 space-y-6">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                  Build Impact Reports That <span className="text-orange-600/90">Make a Difference</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-lg">
                  Streamline your charity&apos;s reporting process with a tool designed to replace manual Word documents and
                  simplify approvals.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button size="lg" onClick={() => window.location.href = '/register'} className="bg-orange-600/90 hover:bg-orange-700/90 text-white">
                    Register
                  </Button>
                  <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-orange-50" onClick={() => window.location.href = 'mailto:support@impactengine.global'}>
                    Book a Demo
                  </Button>
                </div>
              </div>
              <div className="flex-1 relative flex justify-center">
                <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 md:p-8 w-80 sm:w-96 md:w-full">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-3 w-3 rounded-full bg-red-400"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                    <div className="h-3 w-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-8 bg-gray-100 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-100 rounded w-full"></div>
                    <div className="h-4 bg-gray-100 rounded w-full"></div>
                    <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                    <div className="h-20 bg-orange-50/50 rounded border border-orange-100/50 w-full"></div>
                    <div className="flex justify-end">
                      <div className="h-10 bg-orange-500/80 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 bg-orange-100/30 h-full w-full rounded-lg -z-10"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Simplify Your Impact Reporting</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our platform helps charities create professional impact reports while streamlining the review process
                for funders like Mercy Mission.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-orange-50 text-orange-600/80 p-3 rounded-full w-fit mb-4">
                  <FileText size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Structured Templates</h3>
                <p className="text-gray-600">
                  Replace manual Word documents with intuitive templates designed for impact reporting.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-orange-50 text-orange-600/80 p-3 rounded-full w-fit mb-4">
                  <Clock size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Deadline Alerts</h3>
                <p className="text-gray-600">
                  Never miss a reporting deadline with automated notifications for all stakeholders.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-orange-50 text-orange-600/80 p-3 rounded-full w-fit mb-4">
                  <MessageSquare size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">In-App Communication</h3>
                <p className="text-gray-600">
                  Keep all feedback and revisions in one place, eliminating scattered email threads.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-orange-50 text-orange-600/80 p-3 rounded-full w-fit mb-4">
                  <CheckCircle size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Approval Workflow</h3>
                <p className="text-gray-600">
                  Streamline the iterative approval and rejection process with clear status tracking.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">How It Works</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our platform connects charities and funders in a seamless workflow
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md border border-orange-100/50">
                  <span className="text-2xl font-bold text-orange-600/80">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Create</h3>
                <p className="text-gray-600">Charities build impact reports using intuitive templates and tools</p>
              </div>

              <div className="text-center">
                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md border border-orange-100/50">
                  <span className="text-2xl font-bold text-orange-600/80">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Review</h3>
                <p className="text-gray-600">Mercy Mission reviews submissions and provides detailed feedback</p>
              </div>

              <div className="text-center">
                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md border border-orange-100/50">
                  <span className="text-2xl font-bold text-orange-600/80">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Approve</h3>
                <p className="text-gray-600">Final reports are approved and stored for future reference</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial Section (Placeholder) */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-8 md:p-12 text-white max-w-4xl mx-auto border-l-4 border-orange-500/70">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                  <h2 className="text-2xl md:text-3xl font-bold mb-6">
                    &quot;Impact Report Builder has transformed how we communicate our charity&apos;s outcomes to funders.&quot;
                  </h2>
                  <p className="text-lg opacity-90 mb-4">
                    The platform has saved us countless hours and improved our relationship with Mercy Mission through
                    clearer communication.
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full"></div>
                    <div>
                      <p className="font-medium">Sarah Johnson</p>
                      <p className="opacity-75 text-sm">Program Director, Hope Charity</p>
                    </div>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="w-32 h-32 bg-white/20 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-2">
        <div className="container mx-auto px-4">

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">© 2025 Impact Engine. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link href="#" className="text-gray-400 hover:text-orange-300 transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-orange-300 transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
