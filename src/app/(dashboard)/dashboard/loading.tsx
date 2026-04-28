import React from "react";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 sm:space-y-10 animate-pulse pb-20">
      <div className="h-10 w-64 bg-[#111827] rounded-xl border border-[#1f2937]" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
        {/* Left Column Skeletons */}
        <div className="lg:col-span-4 grid grid-cols-1 gap-6 sm:gap-8 auto-rows-fr">
          <div className="bg-[#111827] border border-[#1f2937] p-10 rounded-[40px] h-[200px]" />
          <div className="bg-[#111827] border border-[#1f2937] p-10 rounded-[40px] h-[200px]" />
        </div>

        {/* Right Column Skeleton */}
        <div className="lg:col-span-8">
          <div className="bg-[#111827] border border-[#1f2937] p-10 rounded-[48px] h-full min-h-[350px]" />
        </div>

        {/* Bottom Section Skeleton */}
        <div className="lg:col-span-12">
          <div className="bg-[#111827] border border-[#1f2937] rounded-[40px] h-[400px]" />
        </div>
      </div>
    </div>
  );
}
