import React from "react";
import { getDashboardData } from "@/app/actions/dashboard";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  const data = await getDashboardData();
  
  return <DashboardClient initialData={data} />;
}
