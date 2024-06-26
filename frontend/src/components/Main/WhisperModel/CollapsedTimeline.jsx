import React, { useEffect, useState, useCallback } from 'react';
import Chart from "react-apexcharts";
import { convertMsToTime } from "../../../utils/convertMsToTime";

export default function CollapsedTimeline({ categorizedQuestions }) {
  const [timeLine, setTimeLine] = useState([]);

  const setTimeLineData = useCallback(() => {
    let timeData = [];
    let questionList = categorizedQuestions;

    const labelColors = {
      0: "#0000FF",
      1: "#D42AC8",
      2: "#009400",
      3: "#FF7300",
    };
  
    const minTime = Math.min(...categorizedQuestions.map((q) => q.start_time / 1000));
    const maxTime = Math.max(...categorizedQuestions.map((q) => q.start_time / 1000));
    const totalTimeRange = maxTime - minTime;
    
    // Adjust the constant width percentage as needed
    const entryWidthPercentage = 0.01;
    const constantWidth = totalTimeRange * entryWidthPercentage;
  
    let initialEntry = {
      x: "Questions",
      y: [0, maxTime],
      fillColor: "#FFFFFF",
    };
    timeData.push(initialEntry);
  
    for (let i = 0; i < questionList.length; i++) {
      if (labelColors.hasOwnProperty(questionList[i].level)) {
        let endTime;
        if (i < questionList.length - 1) {
          endTime = Math.min(
            questionList[i + 1].start_time / 1000,
            questionList[i].start_time / 1000 + constantWidth
          );
        } else {
          endTime = questionList[i].start_time / 1000 + constantWidth;
        }
  
        let duration = endTime - questionList[i].start_time / 1000;
        let relativeWidth = (duration / totalTimeRange) * 100; // Calculate relative width as a percentage
        let barWidth = Math.max(relativeWidth, constantWidth); // Ensure bar width is at least the minimum width
  
        let entry = {
          x: "Questions",
          y: [questionList[i].start_time / 1000, endTime],
          fillColor: labelColors[questionList[i].level],
          label: {
            text: questionList[i].level === 0 ? "NA" : `Level ${questionList[i].level}`,
            style: {
              color: "#fff",
              background: labelColors[questionList[i].level],
              fontSize: '12px',
              borderRadius: '3px',
              padding: '3px 6px'
            }
          },
          options: {
            barWidth: barWidth + '%', // Set bar width dynamically
          },
        };
        timeData.push(entry);
      }
    }
    return timeData;
  },[categorizedQuestions])
 
  useEffect(() => {
    if (categorizedQuestions) {
      setTimeLine(setTimeLineData());
    }
  }, [categorizedQuestions, setTimeLineData]);

  function getTimeLineProps() {
    return {
      series: [
        {
          data: timeLine,
          name: "Questions",
        },
      ],
      options: {
        chart: {
          type: "rangeBar",
        },
        title: {
          text: "Collapsed Timeline",
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
            distributed: true,
            dataLabels: {
              hideOverflowingLabels: false,
            },
          },
        },
        dataLabels: {
          enabled: false,
        },
        tooltip: {
          enabled: true,
          custom: function ({ seriesIndex, dataPointIndex, w }) {
            //because 6 init entries
            let tooltipIndex = dataPointIndex - 1;
            let questionList = categorizedQuestions || [];

            let question = questionList[tooltipIndex];
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
        xaxis: {
          type: "numeric",
          labels: {
            formatter: function (val) {
              return convertMsToTime(val * 1000);
            },
          },
        },
        yaxis: {
          labels: {
            style: {
              fontSize: "20px",
            },
          },
          categories: ["Questions"],
        },
      },
    };
  }

  return (
    <>
      {categorizedQuestions ? (
        <table>
          <tbody>
            <tr>
              <td id="timeLineContainer">
                <Chart
                  options={getTimeLineProps().options}
                  series={getTimeLineProps().series}
                  type="rangeBar"
                  height={600}
                  width={1400}
                />
              </td>
            </tr>
          </tbody>
        </table>
      ) : (
        <div>Please wait for questions to be categorized</div>
      )}
    </>
  );
}
