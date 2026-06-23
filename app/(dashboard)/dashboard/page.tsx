import UploadCard from "@/components/UploadCard";
import { Image as ImageIcon, HardDrive, Clock } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-primary text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome back, Admin!</h1>
          <p className="text-primary-100 opacity-90">Here's what's happening with your gallery today.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-xl flex items-center gap-4 border-l-4 border-l-primary">
          <div className="p-4 bg-primary/10 text-primary rounded-full">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Images</p>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl flex items-center gap-4 border-l-4 border-l-accent">
          <div className="p-4 bg-accent/10 text-accent rounded-full">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Drive Storage</p>
            <p className="text-2xl font-bold text-gray-900">Configuring...</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl flex items-center gap-4 border-l-4 border-l-secondary">
          <div className="p-4 bg-secondary/10 text-secondary rounded-full">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Recent Uploads</p>
            <p className="text-2xl font-bold text-gray-900">0 today</p>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="mt-8">
        <UploadCard />
      </div>
    </div>
  );
}
