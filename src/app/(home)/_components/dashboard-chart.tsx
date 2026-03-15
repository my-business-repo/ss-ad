"use client";

import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

// Dynamically import ApexCharts to prevent SSR issues
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface ChartDataPoint {
  date: string;
  customers: number;
  deposits: number;
  withdrawals: number;
}

interface DashboardChartProps {
  data: ChartDataPoint[];
}

export function DashboardChart({ data }: DashboardChartProps) {
  // Extract categories (dates) and series arrays
  const categories = data.map((d) => d.date);
  const customersData = data.map((d) => d.customers);
  const depositsData = data.map((d) => d.deposits);
  const withdrawalsData = data.map((d) => d.withdrawals);

  const series = [
    {
      name: "New Customers",
      type: "column",
      data: customersData,
    },
    {
      name: "Deposits ($)",
      type: "area",
      data: depositsData,
    },
    {
      name: "Withdrawals ($)",
      type: "line",
      data: withdrawalsData,
    },
  ];

  const options: ApexOptions = {
    chart: {
      height: 350,
      type: "line",
      stacked: false,
      toolbar: {
        show: false,
      },
      fontFamily: "inherit",
    },
    stroke: {
      width: [0, 2, 2],
      curve: "smooth",
    },
    plotOptions: {
      bar: {
        columnWidth: "20%",
        borderRadius: 2,
      },
    },
    fill: {
      opacity: [1, 0.2, 1],
      type: ["solid", "solid", "solid"],
    },
    labels: categories,
    xaxis: {
      type: "category",
    },
    yaxis: [
      {
        title: {
          text: "Customers",
          style: {
            fontWeight: 500,
          },
        },
      },
      {
        opposite: true,
        title: {
          text: "Amount ($)",
          style: {
            fontWeight: 500,
          },
        },
        labels: {
          formatter: (val: number) => {
            if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
            return val.toString();
          },
        },
      },
    ],
    colors: ["#5750F1", "#10B981", "#EF4444"], // Primary, Green, Red
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: function (y, { seriesIndex }) {
          if (typeof y !== "undefined") {
            return seriesIndex === 0 ? y.toFixed(0) : "$" + y.toFixed(2);
          }
          return y;
        },
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
    },
    dataLabels: {
      enabled: false,
    },
  };

  return (
    <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card h-full">
      <div className="mb-4">
        <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
          App Activity Overview
        </h2>
        <span className="text-sm text-body-color dark:text-dark-6">
          14-Day History
        </span>
      </div>

      <div id="chartOne" className="w-full">
        <ReactApexChart
          options={options}
          series={series}
          type="line"
          height={350}
          width="100%"
        />
      </div>
    </div>
  );
}
