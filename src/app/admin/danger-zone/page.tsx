'use client';

import { useState } from 'react';
import { clearAllData, seedDemoData } from '@/lib/seed';
import { AlertTriangle, Trash2, Database, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DangerZonePage() {
  const [loading, setLoading] = useState(false);

  const handleSeed = async () => {
    if (!window.confirm("This will clear all current data and insert demo data. Are you sure?")) {
      return;
    }

    setLoading(true);
    try {
      await seedDemoData();
      toast.success("Demo data seeded successfully!");
    } catch (error) {
      toast.error("Failed to seed data.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm("WARNING: This will permanently delete ALL data across ALL collections. This cannot be undone. Are you absolutely sure?")) {
      return;
    }

    setLoading(true);
    try {
      await clearAllData();
      toast.success("All data cleared successfully.");
    } catch (error) {
      toast.error("Failed to clear data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Danger Zone</h1>

      <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-6">
        <div className="flex items-start mb-6">
          <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-500 mr-3 flex-shrink-0" />
          <div>
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-400">Proceed with caution</h2>
            <p className="text-sm text-red-600 dark:text-red-300 mt-1">
              Actions here can permanently alter or destroy your portfolio data.
              Only use these tools for development, testing, or complete resets.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-100 dark:border-red-800/50">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Seed Demo Data</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Wipes current data and populates the database with realistic fake content. Useful for testing the layout.
              </p>
            </div>
            <button
              onClick={handleSeed}
              disabled={loading}
              className="ml-4 flex-shrink-0 flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 font-medium transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Database className="w-5 h-5 mr-2" />}
              Seed Data
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-100 dark:border-red-800/50">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Clear All Data</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Permanently deletes every document in every collection. Leaves you with a completely empty site.
              </p>
            </div>
            <button
              onClick={handleClear}
              disabled={loading}
              className="ml-4 flex-shrink-0 flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Trash2 className="w-5 h-5 mr-2" />}
              Clear Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
