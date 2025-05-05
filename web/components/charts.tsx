"use client";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// Define types for props
interface ClassificationPieChartProps {
  classification_counts: Record<string, number>;
}

interface SegmentationDonutChartProps {
  object_counts: Record<string, number>;
}

// Define type for chart data
interface ChartData {
  name: string;
  value: number;
}

// Pie Chart for Classification Proportions
export const ClassificationPieChart: React.FC<ClassificationPieChartProps> = ({
  classification_counts,
}) => {
  const data: ChartData[] = Object.keys(classification_counts).map((key) => ({
    name: key,
    value: classification_counts[key],
  }));
  const COLORS: string[] = ["#0088FE", "#00C49F", "#FFBB28"];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Donut Chart for Segmentation
export const SegmentationDonutChart: React.FC<SegmentationDonutChartProps> = ({
  object_counts,
}) => {
  const data: ChartData[] = Object.keys(object_counts).map((key) => ({
    name: key,
    value: object_counts[key],
  }));
  const COLORS: string[] = ["#FF8042", "#FFBB28"];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          innerRadius={40}
          fill="#8884d8"
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};
