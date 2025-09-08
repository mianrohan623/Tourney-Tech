"use client";

import {
  Users,
  DollarSign,
  Activity,
  ClipboardList,
  FileText,
  Clock,
  UserPlus,
} from "lucide-react";

const cardData = [
  {
    title: "Total Users",
    value: "1,204",
    icon: Users,
    bg: "bg-[var(--card-background)]",
    iconColor: "text-[var(--accent-color)]",
  },
  {
    title: "Active Sessions",
    value: "312",
    icon: Activity,
    bg: "bg-[var(--card-background)]",
    iconColor: "text-[var(--accent-color)]",
  },
  {
    title: "Total Tournaments",
    value: "84",
    icon: FileText,
    bg: "bg-[var(--card-background)]",
    iconColor: "text-[var(--accent-color)]",
  },
  {
    title: "New Sign up's",
    value: "52",
    icon: UserPlus,
    bg: "bg-[var(--card-background)]",
    iconColor: "text-[var(--accent-color)]",
  },
];

export default function AdminPage() {
  return (
    <div className="">
      <h1 className="text-2xl font-bold text-white mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {cardData.map((card, i) => (
          <DashboardCard
            key={i}
            title={card.title}
            value={card.value}
            icon={card.icon}
            bg={card.bg}
            iconColor={card.iconColor}
          />
        ))}
      </div>
    </div>
  );
}

function DashboardCard({ title, value, icon: Icon, bg, iconColor }) {
  return (
    <div
      className={`rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-200 ${bg}`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`p-3 rounded-lg bg-[var(--background)] shadow-sm ${iconColor}`}
          aria-hidden="true"
        >
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h2 className="text-xl font-semibold text-foreground">{value}</h2>
        </div>
      </div>
    </div>
  );
}
