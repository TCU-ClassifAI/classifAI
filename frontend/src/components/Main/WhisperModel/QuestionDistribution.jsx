import React, { useState, useEffect } from 'react';
import Chart from "react-apexcharts";

export default function QuestionDistribution({ categorizedQuestions }) {
  const [levels, setLevels] = useState([0, 0, 0, 0]);
  useEffect(() => {
    if (categorizedQuestions && categorizedQuestions.length > 0) {
      const newLevels = [0, 0, 0, 0];
      categorizedQuestions.forEach(question => {
        newLevels[question.level]++;
      });
      setLevels(newLevels);
    }
  }, [categorizedQuestions]);

  if (!categorizedQuestions) {
    return (<div>Please wait for questions to be categorized.</div>)
  }

  const barChartProps = {
    options: {
      title: {
        text: "Question Costa Level Distribution",
        align: "left",
        style: {
          fontSize: "30px",
          fontWeight: "bold",
          fontFamily: undefined,
          color: "#263238",
        },
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: "28px",
          fontFamily: "Helvetica, Arial, sans-serif",
          fontWeight: "bold",
        },
      },
      xaxis: {
        labels: {
          style: {
            fontSize: "20px",
          },
        },
        categories: [
          "NA",
          "Low Level",
          "Medium Level",
          "High Level",
        ],
      },
      tooltip: {
        enabled: false, // Disable the tooltip on mouseover
      },
    },
    series: [
      {
        data: [
          {
            x: "NA",
            y: levels[0],
            fillColor: "#0000FF",
            strokeColor: "#000000",
          },
          {
            x: "Low Level",
            y: levels[1],
            fillColor: "#D42AC8",
            strokeColor: "#C23829",
          },
          {
            x: "Medium Level",
            y: levels[2],
            fillColor: "#009400",
            strokeColor: "#C23829",
          },
          {
            x: "High Level",
            y: levels[3],
            fillColor: "#FF7300",
            strokeColor: "#C23829",
          },
        ],
      },
    ],
  };

  return (
    <>
      <div className="card-deck mb-3 text-center">
        <table>
          <tbody>
            <tr>
              <td id="barChartContainer">
                <Chart
                  options={barChartProps.options}
                  series={barChartProps.series}
                  type="bar"
                  width="1400"
                  height="600"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
