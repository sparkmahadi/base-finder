export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-12">
      
      {/* Hero Section */}
      <div className="bg-white p-10 rounded-3xl shadow-lg text-center">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-4">Garment Sample Tracking</h1>
        <p className="text-lg text-gray-600 mb-6">
          Track, manage, and streamline your garment sample workflow.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl cursor-pointer shadow">
            Add New Sample
          </button>
          <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl cursor-pointer shadow">
            Browse Samples
          </button>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid md:grid-cols-3 gap-6">
        <FeatureCard title="Live Status" description="Real-time tracking of all sample movements." />
        <FeatureCard title="Intelligent Sorting" description="Auto-update positions for smooth sample organization." />
        <FeatureCard title="Audit Trail" description="Complete logs of who took and returned samples." />
      </div>

      {/* Latest Sample Activity Preview */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Latest Activity</h2>
        <p className="text-gray-500 mb-4">Monitor recent actions from your team.</p>
        <div className="bg-white p-4 rounded-xl shadow">
          <ul className="text-sm text-gray-700 space-y-2">
            <li>🟢 Sample #102 returned by Alice at 10:34 AM</li>
            <li>🔵 Sample #98 taken by Bob for presentation</li>
            <li>🟡 Sample #104 repositioned to Shelf A / Div 3</li>
          </ul>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Team</h2>
        <div className="flex flex-wrap gap-6">
          <TeamMember name="Alice Roy" role="Sample Manager" />
          <TeamMember name="Bob Khan" role="Quality Analyst" />
          <TeamMember name="Sarah Lin" role="Inventory Controller" />
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-100 p-6 rounded-2xl shadow">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">What Our Users Say</h2>
        <blockquote className="italic text-gray-700">“The best way we&apos;ve ever tracked garment samples. It&apos;s fast, transparent, and smart.”</blockquote>
        <p className="mt-2 text-right text-sm text-gray-500">– QA Department, TrendTex Ltd.</p>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white p-10 rounded-3xl text-center shadow-lg">
        <h2 className="text-3xl font-bold mb-3">Start Tracking Smarter Today</h2>
        <p className="mb-6">Join our growing team of professionals using smart sample tracking.</p>
        <button className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-xl shadow hover:bg-gray-100">
          Get Started
        </button>
      </div>

      {/* Maker Section */}
      <div className="text-center text-sm text-gray-500 mt-10 border-t pt-6">
        <p>
          Made with ❤️ by <strong>Md. Mahadi Hasan</strong>
        </p>
        <p className="mt-1">
          Textile Engineer | MBA in Supply Chain Management
        </p>
        <p className="mt-1">
          Email: <a href="mailto:mahadihasan@engineer.com" className="text-blue-600 hover:underline">mahadihasan@engineer.com</a>
        </p>
      </div>
    </div>
  );
}

// Helper Components

function FeatureCard({ title, description }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function TeamMember({ name, role }) {
  return (
    <div className="bg-gray-100 p-4 rounded-xl text-center shadow w-52">
      <div className="w-16 h-16 rounded-full bg-gray-300 mx-auto mb-2" />
      <h4 className="font-semibold">{name}</h4>
      <p className="text-sm text-gray-600">{role}</p>
    </div>
  );
}
