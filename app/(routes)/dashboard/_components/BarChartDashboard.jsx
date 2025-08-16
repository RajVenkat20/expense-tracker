import React from "react";
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function BarChartDashboard({ budgetList }) {
  return (
    <div className="border-2 shadow-md shadow-indigo-300 rounded-lg p-5 transform transition-all ease-out duration-300 hover:scale-103 hover:shadow-lg">
      <h2 className="font-bold text-lg mb-4">
        Spending Breakdown for Budget Types
      </h2>
      <ResponsiveContainer width={"80%"} height={300}>
        <BarChart
          data={budgetList}
          margin={{
            top: 7,
          }}
        >
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend
            wrapperStyle={{
              marginTop: 30,
            }}
          />
          <Bar
            dataKey="totalSpend"
            name="Amount Used"
            stackId="a"
            fill="#4845d2"
          />
          <Bar
            dataKey="amount"
            name="Amount Allocated"
            stackId="a"
            fill="#C3C2FF"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BarChartDashboard;
