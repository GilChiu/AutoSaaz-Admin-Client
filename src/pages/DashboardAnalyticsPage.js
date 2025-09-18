import React from "react";
import DirhamIcon from "../components/DirhamIcon";

// Simple analytics placeholder (can be expanded with real data fetching layer later)
const DashboardAnalyticsPage = () => {
  const cards = [
    { label: "Total Users", value: "12.8k", change: "+12.5% from last month" },
    { label: "Total Garages", value: "324", change: "+8.3% from last month" },
    { label: "Total Bookings", value: "8.9k", change: "+15.2% from last month" },
    { label: "Total Revenue", value: { symbol: true, text: "24.9L" }, change: "+23.1% from last month" },
    { label: "Active bookings", value: "127", change: "Today" },
    { label: "Average booking value", value: { symbol: true, text: "324" }, change: "" },
    { label: "Escrow Balance", value: { symbol: true, text: "145k" }, change: "" },
    { label: "Pending Disputes", value: "8", change: "" }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">Analytics</h2>
      <div className="grid gap-4 md:grid-cols-4 sm:grid-cols-2">
        {cards.map(card => (
          <div key={card.label} className="bg-white border border-gray-200 rounded-md p-4">
            <div className="text-[11px] font-medium text-gray-500 mb-1">{card.label}</div>
            <div className="text-base font-semibold text-gray-800">
              {typeof card.value === 'object' && card.value?.symbol ? (
                <span className="inline-flex items-center gap-1">
                  <DirhamIcon />
                  {card.value.text}
                </span>
              ) : (
                card.value
              )}
            </div>
            {card.change && (
              <div className="mt-1 text-[11px] font-medium text-green-600 flex items-center gap-1">
                <span className="inline-block bg-green-100 text-green-700 px-1.5 py-0.5 rounded">↗</span>
                {card.change}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardAnalyticsPage;