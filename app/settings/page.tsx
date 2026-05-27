"use client";

import { useStore } from "@/store/useStore";
import { UserCircle } from "lucide-react";

export default function Settings() {
  const { user } = useStore();

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <UserCircle size={24} className="text-blue-400" /> Profile Information
          </h2>
          
          {user ? (
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <div className="px-4 py-3 bg-black/50 border border-white/10 rounded-xl">{user.name}</div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <div className="px-4 py-3 bg-black/50 border border-white/10 rounded-xl">{user.email}</div>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">Please log in to view profile settings.</p>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <h2 className="text-xl font-semibold mb-6">Preferences</h2>
          <p className="text-gray-400">More settings coming soon.</p>
        </div>
      </div>
    </div>
  );
}
