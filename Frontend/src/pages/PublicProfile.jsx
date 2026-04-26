import React, { useEffect, useRef, useState, useMemo } from "react";
import { Chart, registerables } from "chart.js";
import axiosInstance from "../config/Axios.config.js";
import { useParams, useNavigate } from "react-router-dom";

Chart.register(...registerables);

const MONTHS = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];

// ================= DIFFICULTY RING COMPONENT =================
const DifficultyRing = ({ label, solved, total, color, textColor }) => {
  const percentage = total > 0 ? (solved / total) * 100 : 0;
  const radius = 36;
  const stroke = 5;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2}>
          <circle
            stroke="#1A1A1A"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
          />
        </svg>
        <div className="absolute text-xs font-bold">
          {Math.round(percentage)}%
        </div>
      </div>
      <div className="text-center">
        <p className={`text-sm font-semibold ${textColor}`}>{label}</p>
        <p className="text-xs text-white/40">{solved}/{total}</p>
      </div>
    </div>
  );
};

const PublicProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalCompleted: 0,
    streak: 0,
    monthlyProgress: [],
    dailyMap: {},
    difficultyBreakdown: { Easy: 0, Medium: 0, Hard: 0 },
  });
  const [totalCounts, setTotalCounts] = useState({ Easy: 0, Medium: 0, Hard: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ================= FETCH DATA =================
  useEffect(() => {
    Promise.all([
      axiosInstance.get(`/progress/public/${userId}`),
      axiosInstance.get("/problems/list?limit=9999"),
    ])
      .then(([statsRes, problemsRes]) => {
        setUser(statsRes.data.user);
        setStats(statsRes.data.summary);

        // ✅ Count total Easy/Medium/Hard
        const problems = problemsRes.data?.problems ?? [];
        const counts = { Easy: 0, Medium: 0, Hard: 0 };
        problems.forEach((p) => {
          if (counts[p.difficulty] !== undefined) counts[p.difficulty]++;
        });
        setTotalCounts(counts);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load public profile.");
      })
      .finally(() => setLoading(false));
  }, [userId]);

  // ================= CHART =================
  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();

    chartInstance.current = new Chart(chartRef.current, {
      type: "line",
      data: {
        labels: MONTHS,
        datasets: [
          {
            data: stats.monthlyProgress || Array(12).fill(0),
            borderColor: "#A4873E",
            backgroundColor: "rgba(164,135,62,0.15)",
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.45,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { display: false },
          y: { display: false },
        },
      },
    });

    return () => chartInstance.current?.destroy();
  }, [stats.monthlyProgress]);

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // ================= HEATMAP =================
  const heatmapGrid = useMemo(() => {
    const today = new Date();
    const grid = [];
    for (let i = 0; i < 365; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const key = formatDate(date);
      const count = stats.dailyMap?.[key] || 0;
      grid.push({ key, count });
    }
    return grid;
  }, [stats.dailyMap]);

  const getColor = (count) => {
    if (!count) return "bg-white/5";
    if (count === 1) return "bg-green-500/20";
    if (count === 2) return "bg-green-500/40";
    if (count === 3) return "bg-green-500/60";
    return "bg-green-500/80";
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#070707] text-white flex items-center justify-center">
        <p className="text-gray-400 animate-pulse">Loading public profile...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-[#070707] text-white flex flex-col items-center justify-center p-6">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl max-w-md text-center">
          <p className="text-xl font-bold mb-2">Oops!</p>
          <p>{error || "User not found"}</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 px-5 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const breakdown = stats.difficultyBreakdown ?? { Easy: 0, Medium: 0, Hard: 0 };

  return (
    <div className="min-h-screen bg-[#070707] text-white p-6 relative">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="absolute top-6 right-6 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center gap-2 text-sm text-gray-400 hover:text-white z-10"
      >
        <i className="ri-arrow-left-line"></i> Back
      </button>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-8 mt-12 md:mt-0">
        <div className="w-20 h-20 rounded-2xl bg-[#181818] border border-[#A4873E]/30 flex items-center justify-center text-3xl font-bold">
          {user.avatar ? (
            <img src={user.avatar} alt="avatar" className="w-full h-full rounded-2xl object-cover" />
          ) : (
            getInitials(user.name)
          )}
        </div>
        <div className="text-center md:text-left mt-2 md:mt-0">
          <p className="text-3xl font-bold capitalize text-white">{user.name}</p>
          <p className="text-sm text-[#A4873E] mt-1"><i className="ri-shield-user-line"></i> Public Profile</p>
        </div>
      </div>

      {/* TOP GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1.5fr_1fr] gap-5 mb-5">

        {/* CHART */}
        <div className="rounded-2xl bg-[#0b0b0b] border border-white/10 p-5">
          <p className="text-lg mb-3">Problem Solved Trend</p>
          <div className="h-[200px]">
            <canvas ref={chartRef} />
          </div>
        </div>

        {/* ✅ DIFFICULTY RINGS */}
        <div className="rounded-2xl bg-[#0b0b0b] border border-white/10 p-5">
          <p className="text-lg mb-4">Problem Solving Progress</p>
          <div className="flex justify-around items-center h-[calc(100%-44px)]">
            <DifficultyRing
              label="Easy"
              solved={breakdown.Easy}
              total={totalCounts.Easy}
              color="#22c55e"
              textColor="text-green-400"
            />
            <DifficultyRing
              label="Medium"
              solved={breakdown.Medium}
              total={totalCounts.Medium}
              color="#eab308"
              textColor="text-yellow-400"
            />
            <DifficultyRing
              label="Hard"
              solved={breakdown.Hard}
              total={totalCounts.Hard}
              color="#ef4444"
              textColor="text-red-400"
            />
          </div>
        </div>

        {/* STATS */}
        <div className="flex flex-col gap-5">
          <div className="rounded-2xl flex gap-5 bg-[#0b0b0b] border border-white/10 p-5">
            <div className="h-14 flex justify-center items-center w-14 rounded-[20px] bg-[#181818]">
              <i className="ri-award-fill text-[30px] text-blue-400"></i>
            </div>
            <div>
              <p className="text-3xl font-bold">{stats.totalCompleted}</p>
              <p className="text-gray-400">Problem Solved</p>
            </div>
          </div>

          <div className="rounded-2xl flex gap-5 bg-[#0b0b0b] border border-white/10 p-5">
            <div className="h-14 flex justify-center items-center w-14 rounded-[20px] bg-[#181818]">
              <i className="ri-pie-chart-2-fill text-[30px] text-green-400"></i>
            </div>
            <div>
              <p className="text-3xl font-bold">{stats.streak}</p>
              <p className="text-gray-400">Current Streak</p>
            </div>
          </div>
        </div>

      </div>

      {/* HEATMAP */}
      <div className="rounded-2xl bg-[#0b0b0b] border border-white/10 p-5">
        <div className="mb-5">
          <p className="text-3xl font-bold">{stats.totalCompleted}</p>
          <p className="text-gray-400 text-sm">Solved Problems</p>
        </div>
        <div className="grid grid-cols-52 gap-[4px] overflow-x-auto">
          {heatmapGrid.map((cell) => (
            <div
              key={cell.key}
              className={`aspect-square rounded-[4px] ${getColor(cell.count)} hover:bg-purple-500/30 transition`}
            />
          ))}
        </div>
      </div>

    </div>
  );
};

export default PublicProfile;
