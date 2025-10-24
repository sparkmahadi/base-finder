'use client';
import React, { useState } from 'react';
import AOSWrapper from './AOSWrapper'; // Import the wrapper component

// --- Icon Definitions (Simulating lucide-react Imports) ---
// Note: Changed to use a simple 'Home' icon for the Nav
const Home = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const Ruler = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.5" /><line x1="12" y1="12" x2="12" y2="18" /><line x1="6" y1="18" x2="18" y2="18" /><path d="M22 13h-4" /><path d="M10 13h-4" />
  </svg>
);

const Scale = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v18" /><path d="M5 15h14" /><path d="M19 19c-1.25-1.56-2-3-2-5c0-3.5 1.5-5.5 2.5-7.5" /><path d="M5 19c1.25-1.56 2-3 2-5c0-3.5-1.5-5.5-2.5-7.5" /><path d="M22 15L19 19H5L2 15" />
  </svg>
);

const LayoutGrid = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><path d="M10 7H14" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M7 10v4" /><path d="M14 17h7" /><path d="M17.5 14.5l-3 3" />
  </svg>
);

const Package = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.89 2.07l.02.01.76 1.74m-3.32-1.75l-.76 1.74M4.77 15.01l4.56-1.52A.5.5 0 0 0 9 13v-3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3a.5.5 0 0 0 .15.39l4.56 1.52a.5.5 0 0 0 .54-.86l-4.56-1.52A1.5 1.5 0 0 1 16 11.01V9.5a.5.5 0 0 0-.5-.5h-7a.5.5 0 0 0-.5.5v1.51a1.5 1.5 0 0 1-1.09 1.48l-4.56 1.52a.5.5 0 0 0 .54.86z" /><path d="M12 21h10" /><path d="M2 21h10" /><path d="M7.5 14.5l4.5-1.5 4.5 1.5" /><path d="M12 13v8" />
  </svg>
);

const MessageCircle = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7.9 20.8A.9.9 0 0 0 8 21.5a.5.5 0 0 0 .5.5H15a.5.5 0 0 0 .5-.5.9.9 0 0 0 .1-.7" /><path d="M21 15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const Rocket = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.08 20.25c-.24-2.58-.29-4.25-1-6.17a3 3 0 0 1-3.66-3.66c-1.92-.71-3.59-.66-6.17-1" /><path d="M19 13.5a6 6 0 0 0-6-6M9 19.5a6 6 0 0 0-6-6" /><path d="M15 15l-1-1" /><path d="M19 19l-1-1" /><path d="M15 9l-1-1" /><path d="M19 5l-1-1" /><path d="M5 19l-1-1" /><path d="M5 5l-1-1" /><path d="M21 3l-1.5 1.5" /><path d="M21 7l-1.5 1.5" /><path d="M17 3l-1.5 1.5" /><path d="M17 7l-1.5 1.5" />
  </svg>
);

const Activity = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

const CheckCircle = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M9 12l2 2 4-4" />
  </svg>
);

// Menu Icon for mobile
const Menu = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

// X/Close Icon for mobile
const X = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ----------------------------------------------------------------
// --- Existing Components (Refined Styling) ---
// ----------------------------------------------------------------

// --- Feature Card Component ---
const FeatureCard = ({ icon, title, description, index }) => (
  <div
    className="bg-white p-6 md:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col space-y-3 transform hover:scale-[1.02]"
    data-aos="fade-up"
    data-aos-delay={index * 100} // Staggered animation
  >
    <div className="flex items-center space-x-3">
      {React.cloneElement(icon, { className: "w-7 h-7 text-indigo-600 flex-shrink-0" })}
      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
    </div>
    <p className="text-gray-600 leading-relaxed text-sm md:text-base">{description}</p>
  </div>
);

// --- Team Member Card Component ---
const TeamMemberCard = ({ name, role, bio, img, index }) => (
  <div
    className="flex flex-col items-center p-6 bg-white rounded-xl shadow-lg border border-gray-100 text-center transition-transform duration-300 hover:shadow-xl hover:-translate-y-1"
    data-aos="zoom-in"
    data-aos-delay={index * 150} // Staggered animation
  >
    <img
      className="w-28 h-28 rounded-full mb-4 object-cover border-4 border-cyan-400 shadow-xl"
      src={img}
      alt={name}
      onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/150x150/6366F1/ffffff?text=Team" }}
    />
    <h3 className="text-xl font-bold text-gray-900">{name}</h3>
    <p className="text-indigo-600 font-medium mb-3">{role}</p>
    <p className="text-sm text-gray-600 line-clamp-3">{bio}</p>
  </div>
);

// --- Testimonial Card Component ---
const TestimonialCard = ({ quote, name, title, index }) => (
  <div
    className="p-8 bg-white rounded-xl shadow-xl border border-cyan-100 flex flex-col justify-between h-full transition-shadow duration-300 hover:shadow-2xl"
    data-aos="fade-up"
    data-aos-delay={index * 200}
  >
    <blockquote className="text-lg italic text-gray-700 mb-6 relative">
      <svg className="w-8 h-8 text-cyan-500 opacity-20 absolute -top-4 -left-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.75 3C8.423 3 5 6.423 5 10.75c0 3.39 1.95 6.136 4.75 7.15V22l3.5-3.5h.5c4.327 0 7.75-3.423 7.75-7.75C21 6.423 17.577 3 13.25 3z" /></svg>
      <p className='relative z-10 font-serif'>{quote}</p>
    </blockquote>
    <div className='mt-4 pt-4 border-t border-gray-100'>
      <p className="font-bold text-cyan-600">{name}</p>
      <p className="text-sm text-gray-500">{title}</p>
    </div>
  </div>
);

// ----------------------------------------------------------------
// --- Main App Component ---
// ----------------------------------------------------------------
const AppContent = () => {
  // Mock Data
  const features = [
    { icon: <Ruler />, title: "Pattern Version Control", description: "Keep complete visibility over your pattern development process — from initial design to release. Monitor progress, updates, and version history effortlessly." },
    { icon: <Scale />, title: "Material Consumption Insights", description: "Record and analyze fabric and trim consumptions for each style or sample. Maintain accurate data for cost estimation and material planning." },
    { icon: <LayoutGrid />, title: "Sample Development Stages", description: "Track each stage of sample creation — from proto to final approval — with clear status updates and timelines." },
    { icon: <Package />, title: "Sample Inventory Management", description: "Store, organize, and manage all physical samples in one digital space. Know what’s available, where it is, and what’s next." },
    { icon: <MessageCircle />, title: "Centralized Buyer Feedback", description: "Centralize and manage buyer feedback on samples or styles. Ensure quick action on revisions and maintain clear communication records." },
  ];

  const latestActivity = [
    { type: "Pattern Release", detail: "Style #4529 'Summer Breeze' Pattern V2.1 released to production.", time: "10 minutes ago" },
    { type: "Sample Approval", detail: "Proto Sample for Jacket Style #7001 approved by Buyer A.", time: "2 hours ago" },
    { type: "Material Consumption", detail: "Consumption data recorded for Trim ID: ZP-302 on Style #4529.", time: "Yesterday" },
    { type: "Pattern Update", detail: "Pattern #1005 updated with new grading rules by Jane Smith.", time: "2 days ago" },
  ];

  const teamMembers = [
    { name: "John Doe", role: "CEO & Visionary", bio: "Drives the strategic vision, merging tech innovation with industry needs and market demands.", img: "https://placehold.co/150x150/5D6C7E/ffffff?text=John+D" },
    { name: "Jane Smith", role: "Technical Lead", bio: "Leads the development of core pattern tracking and sample management modules with precision.", img: "https://placehold.co/150x150/4A5568/ffffff?text=Jane+S" },
    { name: "Alex Chen", role: "Merchandising Specialist", bio: "Ensures future modules align perfectly with buyer coordination and order tracking workflows.", img: "https://placehold.co/150x150/374151/ffffff?text=Alex+C" },
  ];

  const testimonials = [
    { quote: "Base Finder cut our sample approval time by 30%. The pattern version control is a game-changer for our technical team.", name: "Maria L.", title: "Head of R&D, Global Apparel Co." },
    { quote: "For the first time, all buyer comments are centralized and instantly linked to the relevant style. No more lost feedback!", name: "David K.", title: "Product Manager, Lifestyle Brand" },
    { quote: "The consumption insights alone save us hours in cost estimation and material planning. Truly built for our industry.", name: "Sarah B.", title: "Costing Analyst, Textile Group" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
    

      <div className="max-w-screen-2xl mx-auto">

        {/* 1. Professional Hero Section (Split Layout) */}
        <section id="hero" className="relative pt-20 pb-16 md:pt-32 md:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Subtle background gradient or pattern for attractiveness */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-white opacity-60 pointer-events-none"></div>
          
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mx-auto">
            {/* Left Column: Text & CTA */}
            <div className="lg:text-left text-center" data-aos="fade-right">
              {/* Tagline */}
              <span className="inline-block px-3 py-1 text-sm font-semibold text-indigo-700 bg-indigo-100 rounded-full mb-3 shadow-md">
                Apparel Technical Excellence
              </span>
              
              <h1 className="text-5xl md:text-5xl font-extrabold tracking-tight mb-6 text-gray-900 leading-tight">
                Smart Apparel Technical Management 
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
                Streamline **pattern development**, **sample management**, and **material consumption** tracking with industry-specific precision.
              </p>

              <div className="flex justify-center lg:justify-start space-x-4">
                <button
                  className="px-8 py-4 bg-cyan-500 text-white text-lg font-bold rounded-lg shadow-xl hover:bg-cyan-600 transition-all duration-300 transform hover:scale-[1.02] focus:ring-4 focus:ring-cyan-300"
                  onClick={() => console.log("CTA Clicked: Request Demo")}
                  data-aos="zoom-in"
                  data-aos-delay="500"
                >
                  Request a Personalized Demo
                </button>
                <a
                  href="#features"
                  className="px-6 py-4 border-2 border-indigo-600 text-indigo-600 text-lg font-bold rounded-lg hover:bg-indigo-50 transition-colors duration-300 flex items-center"
                  data-aos="zoom-in"
                  data-aos-delay="600"
                >
                  Explore Features &rarr;
                </a>
              </div>
            </div>

            {/* Right Column: Image */}
            <div
              className="relative rounded-xl overflow-hidden shadow-2xl border-4 border-indigo-100 hidden lg:block"
              data-aos="fade-left"
              data-aos-delay="300"
            >
              <img
                src="/workflow.png" // Placeholder
                alt="Digital dashboard showing complex apparel workflow and data management"
                className="w-full h-auto object-cover rounded-xl"
                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/800x600/6366F1/ffffff?text=Apparel+Dashboard" }}
              />
            </div>
          </div>
        </section>

        {/* --- */}

        {/* 2. What You Can Do (Features) Section */}
        <section id="features" className="py-20 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-aos="fade-up">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
              Core Technical Capabilities
            </h2>
            <p className="text-xl text-center text-gray-600 mb-16 max-w-3xl mx-auto">
              Dedicated modules to power every step of your product development cycle, ensuring precision from CAD to shipment.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} index={index} />
            ))}
          </div>
        </section>

        {/* --- */}

        {/* 3. Pattern Management Section */}
        <section id="patterns" className="py-20 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-2xl shadow-xl border-t-8 border-indigo-600">
          <div className="w-full mx-auto p-6 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div data-aos="fade-right">
              <span className="text-sm font-semibold text-indigo-700 uppercase mb-2 block">Technical Deep Dive</span>
              <h2 className="text-4xl font-extrabold text-indigo-700 mb-4">
                Version Control Meets Grading
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Our platform stores and tracks all **pattern revisions** instantly. This eliminates ambiguity, ensures everyone works from the latest approved status, and drastically reduces production errors and time-to-market.
              </p>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1 mr-2" /> **Centralized Version History:** Never lose a revision or struggle with outdated files.</li>
                <li className="flex items-start"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1 mr-2" /> **Automated Status:** Clear tracking (Draft, Graded, Approved, Released) in real-time.</li>
                <li className="flex items-start"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1 mr-2" /> **Secure Digital Access:** Controlled pattern distribution to factory partners globally.</li>
              </ul>
            </div>
            <div
              className="relative overflow-hidden rounded-lg shadow-2xl border-4 border-indigo-200"
              data-aos="fade-left"
              data-aos-delay="300"
            >
              <img
                src="/clothes.jpg" // Placeholder
                alt="A digital dashboard showing pattern version status and tracking information"
                className="w-full h-auto object-cover transition-transform duration-500 hover:scale-[1.05]"
                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/800x600/34D399/1F2937?text=Pattern+Dashboard" }}
              />
              <div className="absolute top-4 right-4 bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-md">
                Approved V3.0
              </div>
            </div>
          </div>
        </section>

        {/* --- */}

        {/* 4. LATEST ACTIVITY SECTION */}
        <section id="activity" className="py-20 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4" data-aos="fade-down">
            Real-Time Activity Feed
          </h2>
          <p className="text-xl text-center text-gray-600 mb-12 max-w-3xl mx-auto" data-aos="fade-down" data-aos-delay="100">
            See immediate updates across all technical operations, ensuring full visibility and accountability.
          </p>
          <div
            className="max-w-6xl mx-auto bg-white p-8 rounded-2xl shadow-2xl border border-indigo-200"
            data-aos="zoom-in-up"
          >
            <ul className="space-y-4">
              {latestActivity.map((activity, index) => (
                <li
                  key={index}
                  className="flex flex-col sm:flex-row items-start sm:items-center p-4 bg-gray-50 rounded-lg border-l-4 border-cyan-500 shadow-sm hover:bg-gray-100 transition-colors"
                  data-aos="fade-up"
                  data-aos-delay={index * 150}
                >
                  <Activity className="w-5 h-5 text-cyan-600 flex-shrink-0 mr-3 mb-2 sm:mb-0 sm:mt-0" />
                  <div className="flex flex-col sm:flex-row sm:justify-between w-full">
                    <p className="text-gray-800 font-medium sm:w-3/4">
                      <span className="font-bold mr-2 text-indigo-600 min-w-[140px] inline-block">{activity.type}:</span>
                      {activity.detail}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 italic mt-1 sm:mt-0 sm:text-right sm:w-1/4 flex-shrink-0">
                      {activity.time}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="text-center mt-8">
              <a href="#" className="text-md font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center justify-center space-x-2">View full audit log <span className="text-xl">→</span></a>
            </div>
          </div>
        </section>

        {/* --- */}

        {/* 5. Roadmap Section */}
        <section
          className="py-20 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 bg-indigo-50/70 rounded-2xl shadow-inner"
          data-aos="fade-zoom-in"
          data-aos-easing="ease-in-sine"
        >
          <div className="w-full mx-auto p-8 border-4 border-cyan-300 rounded-2xl shadow-2xl">
            <div className="flex items-start mb-6 space-x-4">
              <Rocket className="w-8 h-8 text-cyan-700 mt-1 flex-shrink-0" />
              <h2 className="text-3xl font-bold text-cyan-800">
                Future Roadmap: Seamless Merchandising Integration
              </h2>
            </div>
            <p className="text-lg text-cyan-800 mb-8 max-w-4xl">
              Our vision is to bridge the gap between technical data and commercial workflows. Future modules will connect pattern development directly to order fulfillment, creating a true end-to-end PLM solution:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-6 text-cyan-700 text-lg">
              <li className="flex items-start" data-aos="fade-up" data-aos-delay="100">
                <CheckCircle className="w-5 h-5 text-cyan-500 mt-1 flex-shrink-0 mr-3" />
                <div>
                  <span className='font-bold'>Buyer Coordination</span>
                  <p className='text-sm text-cyan-600'>Centralized order management and follow-up.</p>
                </div>
              </li>
              <li className="flex items-start" data-aos="fade-up" data-aos-delay="200">
                <CheckCircle className="w-5 h-5 text-cyan-500 mt-1 flex-shrink-0 mr-3" />
                <div>
                  <span className='font-bold'>Production Tracking</span>
                  <p className='text-sm text-cyan-600'>Real-time order status linked to technical approvals.</p>
                </div>
              </li>
              <li className="flex items-start" data-aos="fade-up" data-aos-delay="300">
                <CheckCircle className="w-5 h-5 text-cyan-500 mt-1 flex-shrink-0 mr-3" />
                <div>
                  <span className='font-bold'>Integrated Reporting</span>
                  <p className='text-sm text-cyan-600'>Analytics combining technical and commercial performance.</p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* --- */}

        {/* 6. TEAM INTRODUCING SECTION */}
        <section id="team" className="py-20 bg-gray-100 rounded-2xl max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <div data-aos="fade-up">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
              Meet the Product Architects
            </h2>
            <p className="text-xl text-center text-gray-600 mb-12 max-w-3xl mx-auto">
              The team combining decades of apparel experience with modern software engineering to solve real industry problems.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-5xl mx-auto">
            {teamMembers.map((member, index) => (
              <TeamMemberCard key={index} {...member} index={index} />
            ))}
          </div>
        </section>

        {/* --- */}

        {/* 7. WHAT OUR USERS SAY SECTION (TESTIMONIALS) */}
        <section id="testimonials" className="py-20 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-aos="fade-down">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-center text-gray-600 mb-12 max-w-3xl mx-auto">
              Real feedback from industry professionals relying on Base Finder every day to streamline their complex operations.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full mx-auto">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} index={index} />
            ))}
          </div>
        </section>

        {/* --- */}
        
        {/* NEW: Final CTA Section */}
        <section className="py-20 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className="p-10 md:p-16 text-center bg-indigo-600 rounded-2xl shadow-2xl"
            data-aos="flip-up"
          >
            <h2 className="text-4xl font-extrabold text-white mb-4">
              Ready to Eliminate Technical Errors?
            </h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
              Schedule a personalized walkthrough to see how Base Finder will integrate seamlessly with your existing apparel workflow.
            </p>
            <button
              className="px-10 py-4 bg-cyan-400 text-indigo-900 text-xl font-bold rounded-lg shadow-2xl hover:bg-cyan-300 transition-all duration-300 transform hover:scale-105"
              onClick={() => console.log("Final CTA Clicked: Schedule Demo")}
              data-aos="zoom-in"
              data-aos-delay="200"
            >
              Schedule Your Free Demo Today →
            </button>
          </div>
        </section>


      </div>

      {/* Footer */}
      <footer id="contact" className="mt-8 pt-8 pb-4 border-t border-gray-200 text-center text-sm text-gray-500 px-4 sm:px-6 lg:px-8 bg-white" data-aos="fade-in">
        <div className='max-w-7xl mx-auto'>
          <p className='mb-2 text-gray-700 font-semibold'>
            Contact us at <a href="mailto:info@basefinder.com" className='text-indigo-600 hover:text-indigo-800'>info@basefinder.com</a> or call <span className='text-gray-900 font-bold'>+1 (555) 123-4567</span>.
          </p>
          <p>© 2025 Base Finder. All rights reserved. | <a href="#" className='hover:underline'>Privacy Policy</a> | <a href="#" className='hover:underline'>Terms of Service</a></p>
        </div>
      </footer>
    </div>
  );
};

// The main export wraps the content in the AOS setup component
const App = () => (
  <AOSWrapper>
    <AppContent />
  </AOSWrapper>
);

export default App;