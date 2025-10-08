import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-center mb-4 text-gray-800 dark:text-white">
            JP7AN Timing System
          </h1>
          <p className="text-xl text-center mb-12 text-gray-600 dark:text-gray-300">
            Professional RFID-based timing system for running events
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Race Types</h2>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>✓ Normal Races (Gun/Chip time)</li>
                <li>✓ Backyard Ultra</li>
                <li>✓ Lap Races</li>
                <li>✓ Time-based Races</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Features</h2>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>✓ Live Results</li>
                <li>✓ Online Registration</li>
                <li>✓ Chip Distribution</li>
                <li>✓ Export to PDF & CSV</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/admin"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-colors"
            >
              Admin Dashboard
            </Link>
            <Link
              href="/register"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-colors"
            >
              Register for Event
            </Link>
            <Link
              href="/live"
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-colors"
            >
              Live Results
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
