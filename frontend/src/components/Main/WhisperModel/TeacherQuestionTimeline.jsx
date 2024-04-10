import React, { useEffect, useState } from 'react';
import Chart from "react-apexcharts";
import { convertMsToTime } from "../../../utils/convertMsToTime";

export default function TeacherQuestionTimeline({ categorizedQuestions }) {
  const [timeChart, setTimeChart] = useState([]);
  console.log(categorizedQuestions);

  const labelColors = {
    3: "#FF7300",
    2: "#009400",
    1: "#D42AC8",
    0: "#0000FF",
  };

  const levelLabels = {
    3: "High",
    2: "Medium",
    1: "Low",
    0: "NA",
  };

  const reversedCategories = Object.values(levelLabels).reverse();



  useEffect(() => {
    if (categorizedQuestions) {
      setTimeChart(setTimeChartData());
    }
  }, [categorizedQuestions]);

  function setTimeChartData() {
    let timeData = [];
    let questionList = categorizedQuestions;

    // Calculate the total time range of the timeline
    const minTime = Math.min(
      ...categorizedQuestions.map((s) => s.start_time / 1000)
    );
    const maxTime = Math.max(
      ...categorizedQuestions.map((s) => s.start_time / 1000)
    );
    const totalTimeRange = maxTime - minTime;

    Math.min(...categorizedQuestions.map((s) => s.start_time));

    // Define the percentage of the total time range to use as the constant width for the entries
    const entryWidthPercentage = 0.04; // Adjust this value as needed
    const constantWidth = totalTimeRange * entryWidthPercentage;


    for (let label of reversedCategories) {
      let initialEntry = {
        x: label,
        y: [0, 0],
        fillColor: labelColors[levelLabels[label]],
      };
      timeData.push(initialEntry);
    }

    for (let i = 0; i < questionList.length; i++) {
      if (labelColors.hasOwnProperty(String(questionList[i].level))) {
        // Use reversedLevelLabels for mapping
        let entry = {
          x: levelLabels[questionList[i].level],
          y: [
            questionList[i].start_time,
            questionList[i].start_time + constantWidth * 1000,
          ],
          fillColor: labelColors[String(questionList[i].level)],
        };
        timeData.push(entry);
      }
    }
    //console.log("timeData:");
    // timeData.sort((a, b) => a.x - b.x); //sort it based on 0-3
    console.log("timeData:", timeData);
    return timeData; // reverse it so 0 is on the bottom of y axis
  }

  function getTimeChartProps() {
    return {
      series: [
        {
          data: timeChart,
        },
      ],
      options: {
        chart: {
          type: "rangeBar",
        },
        title: {
          text: "Question Timeline",
          align: "left",
          style: {
            fontSize: "30px",
            fontWeight: "bold",
            fontFamily: undefined,
            color: "#263238",
          },
        },
        plotOptions: {
          bar: {
            horizontal: true,
          },
        },
        xaxis: {
          type: "numeric",
          labels: {
            formatter: function (val) {
              return convertMsToTime(val);
            },
          },
        },
        yaxis: {
          labels: {
            style: {
              fontSize: "20px",
            },
          },
          categories: reversedCategories, // Use the mapped labels
        },
        tooltip: {
          enabled: true,
          custom: function ({ seriesIndex, dataPointIndex, w }) {
            // Adjust the tooltip index to account for the initial entries
            let tooltipIndex = dataPointIndex - reversedCategories.length;
        
            // Ensure categorizedQuestions is not null or undefined
            let questionList = categorizedQuestions || [];
        
            // Access the question based on the tooltipIndex
            let question = questionList[tooltipIndex];
        
            // Check if the question exists
            if (question) {
              return (
                '<div class="arrow_box">' +
                "<span><strong>Speaker " +
                question.speaker +
                ": </strong>" +
                question.question +
                "</span><br>" +
                "<span>" +
                convertMsToTime(question.start_time) +
                "-" +
                convertMsToTime(question.end_time) +
                "</span>" +
                "</div>"
              );
            }
          },
        },
        
      },
    };
  }

  return (
    <>
      <div className="card-deck mb-3 text-center">
        <table>
          <tbody>
            <tr>
              <td id="timeChartContainer">
                <Chart
                  options={getTimeChartProps().options}
                  series={getTimeChartProps().series}
                  type="rangeBar"
                  height={600}
                  width={1400}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
