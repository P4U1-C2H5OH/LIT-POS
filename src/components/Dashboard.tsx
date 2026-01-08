import React, { useState } from "react";
import { Search, TrendingUp } from "lucide-react";
import logo from "figma:asset/9a588303adbb1fdb50d30917cd5d81adce6d930a.png";

interface DashboardProps {
  userName: string;
  userProfilePicture: string;
}

type TimePeriod = "Monthly" | "Weekly" | "Today";

export function Dashboard({
  userName,
  userProfilePicture,
}: DashboardProps) {
  const [timePeriod, setTimePeriod] =
    useState<TimePeriod>("Weekly");

  const recentSales = [
    {
      name: "Steven Summer",
      time: "02 Minutes Ago",
      amount: 52.0,
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    },
    {
      name: "Jordan Maizee",
      time: "02 Minutes Ago",
      amount: 83.0,
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    },
    {
      name: "Jessica Alba",
      time: "05 Minutes Ago",
      amount: 61.6,
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
    {
      name: "Anna Armas",
      time: "05 Minutes Ago",
      amount: 2351.0,
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    },
    {
      name: "Angelina Boo",
      time: "10 Minutes Ago",
      amount: 152.0,
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    },
    {
      name: "Anastasia Koss",
      time: "12 Minutes Ago",
      amount: 542.0,
      avatar:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop",
    },
    {
      name: "Michael Torres",
      time: "15 Minutes Ago",
      amount: 287.5,
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    },
    {
      name: "Sarah Kim",
      time: "18 Minutes Ago",
      amount: 195.0,
      avatar:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop",
    },
    {
      name: "David Chen",
      time: "22 Minutes Ago",
      amount: 428.75,
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
    },
    {
      name: "Emily Brown",
      time: "25 Minutes Ago",
      amount: 156.3,
      avatar:
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop",
    },
  ];

  const lastOrders = [
    {
      name: "David Astee",
      amount: 1.456,
      status: "Chargeback",
      date: "11 Sep 2022",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    },
    {
      name: "Maria Hulama",
      amount: 42.4378,
      status: "Completed",
      date: "11 Sep 2022",
      avatar:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop",
    },
    {
      name: "Arnold Swarz",
      amount: 3.412,
      status: "Completed",
      date: "11 Sep 2022",
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
    },
    {
      name: "Jennifer Lopez",
      amount: 152.34,
      status: "Completed",
      date: "10 Sep 2022",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    },
    {
      name: "Robert Johnson",
      amount: 8.567,
      status: "Chargeback",
      date: "10 Sep 2022",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    },
    {
      name: "Lisa Anderson",
      amount: 25.89,
      status: "Completed",
      date: "09 Sep 2022",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    },
    {
      name: "James Wilson",
      amount: 52.123,
      status: "Completed",
      date: "09 Sep 2022",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    },
    {
      name: "Patricia Martinez",
      amount: 4.678,
      status: "Completed",
      date: "08 Sep 2022",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
    {
      name: "Michael Davis",
      amount: 19.345,
      status: "Chargeback",
      date: "08 Sep 2022",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    },
    {
      name: "Elizabeth Garcia",
      amount: 33.456,
      status: "Completed",
      date: "07 Sep 2022",
      avatar:
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop",
    },
  ];

  const chartData = [12, 35, 33, 18, 11, 29, 25];
  const days = [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun",
  ];
  const maxValue = Math.max(...chartData);

  // Chart data for different time periods
  const chartDataByPeriod = {
    Monthly: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      current: [28, 35, 42, 38],
      previous: [22, 28, 35, 30],
      currentLabel: "Current Month",
      previousLabel: "Previous Month",
    },
    Weekly: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      current: [12, 35, 33, 18, 25, 29, 25],
      previous: [10, 28, 25, 22, 20, 24, 22],
      currentLabel: "This Week",
      previousLabel: "Last Week",
    },
    Today: {
      labels: ["12AM", "4AM", "8AM", "12PM", "4PM", "8PM"],
      current: [5, 8, 15, 28, 35, 22],
      previous: [6, 10, 18, 25, 30, 20],
      currentLabel: "Today",
      previousLabel: "Yesterday",
    },
  };

  const currentChartData = chartDataByPeriod[timePeriod];
  const maxChartValue = Math.max(
    ...currentChartData.current,
    ...currentChartData.previous,
  );

  return (
    <div className="flex-1 bg-[#ffffff] p-8 relative overflow-y-auto h-screen">
      {/* Background Logo */}
      <div
        className="fixed inset-0 bg-center bg-no-repeat bg-contain opacity-10 pointer-events-none"
        style={{ backgroundImage: `url(${logo})` }}
      ></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-slate-900 mb-1">Dashboard</h1>
            <p className="text-slate-500 text-sm">
              Payments Updates
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search"
                className="bg-white/70 backdrop-blur-md border-2 border-white/50 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#D78B30] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Revenue Card */}
          <div className="bg-gradient-to-br from-green-100 to-green-200 backdrop-blur-md rounded-3xl p-6 shadow-sm border-2 border-white/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-green-700">
                💰 Total Revenue
              </span>
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                +17%
              </span>
            </div>
            <div className="text-3xl text-slate-900 mb-3">
              M56,874
            </div>
            <svg className="w-full h-12" viewBox="0 0 200 50">
              <polyline
                points="0,30 20,25 40,35 60,20 80,28 100,15 120,25 140,18 160,30 180,22 200,28"
                fill="none"
                stroke="#16a34a"
                strokeWidth="2"
                opacity="0.5"
              />
            </svg>
          </div>

          {/*Profit Card */}
          <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 backdrop-blur-md rounded-3xl p-6 shadow-sm border-2 border-white/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-yellow-700">
                ⚡ Profit
              </span>
              <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                +23%
              </span>
            </div>
            <div className="text-3xl text-slate-900 mb-3">
              M24,575
            </div>
            <svg className="w-full h-12" viewBox="0 0 200 50">
              <polyline
                points="0,35 20,30 40,38 60,25 80,32 100,20 120,30 140,23 160,35 180,27 200,33"
                fill="none"
                stroke="#ca8a04"
                strokeWidth="2"
                opacity="0.5"
              />
            </svg>
          </div>

          {/* Inventory Card */}
          <div className="bg-gradient-to-br from-green-100 to-green-200 backdrop-blur-md rounded-3xl p-6 shadow-sm border-2 border-white/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-yellow-700">
                Inventory
              </span>
              {/* <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                +23%
              </span> */}
            </div>
            <div className="text-3xl text-slate-900 mb-3">
              M44,575
            </div>
            {/* <svg className="w-full h-12" viewBox="0 0 200 50">
              <polyline
                points="0,35 20,30 40,38 60,25 80,32 100,20 120,30 140,23 160,35 180,27 200,33"
                fill="none"
                stroke="#ca8a04"
                strokeWidth="2"
                opacity="0.5"
              />
            </svg> */}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Revenue Growth Chart */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-sm border-2 border-white/50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-slate-900 mb-1">
                    Revenue
                  </h3>
                  <div className="flex items-center gap-2 text-green-600">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-2xl">+3.2%</span>
                  </div>
                </div>
                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#D78B30]"></div>
                    <span className="text-xs text-slate-600">
                      {currentChartData.currentLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#94a3b8]"></div>
                    <span className="text-xs text-slate-600">
                      {currentChartData.previousLabel}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/50 rounded-lg p-1">
                  {(
                    [
                      "Monthly",
                      "Weekly",
                      "Today",
                    ] as TimePeriod[]
                  ).map((period) => (
                    <button
                      key={period}
                      onClick={() => setTimePeriod(period)}
                      className={`px-4 py-2 rounded-md text-sm transition-all ${timePeriod === period
                        ? "bg-[#D78B30] text-white shadow-sm"
                        : "text-slate-600 hover:bg-white/50"
                        }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              {/* Line Chart */}
              <div className="relative h-64">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 800 250"
                  preserveAspectRatio="none"
                >
                  {/* Grid lines */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line
                      key={i}
                      x1="0"
                      y1={i * 50}
                      x2="800"
                      y2={i * 50}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Previous period line */}
                  <polyline
                    points={currentChartData.previous
                      .map((value, index) => {
                        const x =
                          (index /
                            (currentChartData.previous.length -
                              1)) *
                          800;
                        const y =
                          200 - (value / maxChartValue) * 180;
                        return `${x},${y}`;
                      })
                      .join(" ")}
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Current period line */}
                  <polyline
                    points={currentChartData.current
                      .map((value, index) => {
                        const x =
                          (index /
                            (currentChartData.current.length -
                              1)) *
                          800;
                        const y =
                          200 - (value / maxChartValue) * 180;
                        return `${x},${y}`;
                      })
                      .join(" ")}
                    fill="none"
                    stroke="#D78B30"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Data points for current period */}
                  {currentChartData.current.map(
                    (value, index) => {
                      const x =
                        (index /
                          (currentChartData.current.length -
                            1)) *
                        800;
                      const y =
                        200 - (value / maxChartValue) * 180;
                      return (
                        <circle
                          key={`current-${index}`}
                          cx={x}
                          cy={y}
                          r="5"
                          fill="#D78B30"
                          stroke="white"
                          strokeWidth="2"
                        />
                      );
                    },
                  )}

                  {/* Data points for previous period */}
                  {currentChartData.previous.map(
                    (value, index) => {
                      const x =
                        (index /
                          (currentChartData.previous.length -
                            1)) *
                        800;
                      const y =
                        200 - (value / maxChartValue) * 180;
                      return (
                        <circle
                          key={`previous-${index}`}
                          cx={x}
                          cy={y}
                          r="5"
                          fill="#94a3b8"
                          stroke="white"
                          strokeWidth="2"
                        />
                      );
                    },
                  )}
                </svg>

                {/* X-axis labels */}
                <div className="flex justify-between mt-2">
                  {currentChartData.labels.map(
                    (label, index) => (
                      <span
                        key={index}
                        className="text-xs text-slate-500"
                      >
                        {label}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </div>

            {/* Last Orders */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-sm border-2 border-white/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-slate-900">Last Orders</h3>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                    Data Updates Every 3 Hours
                  </span>
                  <button className="text-sm text-slate-500 hover:text-slate-700">
                    View All Orders
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                {lastOrders.map((order, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={order.avatar}
                        alt={order.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="text-slate-900">
                        {order.name}
                      </span>
                    </div>
                    <span className="text-slate-900">
                      M{order.amount.toLocaleString()}
                    </span>
                    <span
                      className={`text-xs px-3 py-1 rounded-full ${order.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-purple-100 text-purple-700"
                        }`}
                    >
                      {order.status}
                    </span>
                    <span className="text-sm text-slate-500">
                      {order.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Monthly Profits */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-sm border-2 border-white/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-slate-900">
                  Monthly Profits
                </h3>
              </div>
              <p className="text-sm text-slate-500 mb-4">
                Total Profit Growth of 26%
              </p>

              {/* Donut Chart */}
              <div className="relative w-48 h-48 mx-auto mb-6">
                <svg
                  viewBox="0 0 100 100"
                  className="transform -rotate-90"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="12"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#818cf8"
                    strokeWidth="12"
                    strokeDasharray="150 251"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#a3e635"
                    strokeWidth="12"
                    strokeDasharray="60 251"
                    strokeDashoffset="-150"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="12"
                    strokeDasharray="41 251"
                    strokeDashoffset="-210"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-sm text-slate-500">
                    Total
                  </span>
                  <span className="text-2xl text-slate-900">
                    M76,356
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-400"></div>
                    <span className="text-slate-600">
                      Giveaway
                    </span>
                  </div>
                  <span className="text-slate-900">60%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-lime-400"></div>
                    <span className="text-slate-600">
                      Affiliate
                    </span>
                  </div>
                  <span className="text-slate-900">24%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <span className="text-slate-600">
                      Offline Sales
                    </span>
                  </div>
                  <span className="text-slate-900">16%</span>
                </div>
              </div>
            </div>

            {/* Recent Sales */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-sm border-2 border-white/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-slate-900">Recent Sales</h3>
                <button className="text-sm text-slate-500 hover:text-slate-700">
                  See All
                </button>
              </div>
              <div className="space-y-4">
                {recentSales.map((sale, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={sale.avatar}
                        alt={sale.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="text-sm text-slate-900">
                          {sale.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {sale.time}
                        </div>
                      </div>
                    </div>
                    <span className="text-green-600">
                      +M{sale.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}