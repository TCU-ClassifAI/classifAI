import Chart from "react-apexcharts";
import { convertMsToTime } from "../../../utils/convertMsToTime";

export default function TeacherQuestionTimeline({ categorizedQuestions }) {
  const labelColors = {
    0: "#0000FF",
    1: "#D42AC8",
    2: "#009400",
    3: "#FF7300",
  };

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

    for (let label in labelColors) {
      let initialEntry = {
        x: label,
        y: [0, 0],
        fillColor: labelColors[label],
      };
      timeData.push(initialEntry);
    }

    for (let i = 0; i < questionList.length; i++) {
      if (labelColors.hasOwnProperty(String(questionList[i].level))) {
        let entry = {
          x: String(questionList[i].level),
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
    timeData.sort((a, b) => a.x - b.x); //sort it based on 0-3
    return timeData.reverse(); // reverse it so 0 is on the bottom of y axis
  }

  function getTimeChartProps() {
    return {
      series: [
        {
          data: setTimeChartData(),
        },
      ],
      options: {
        chart: {
          type: "rangeBar",
        },
        title: {
          text: "Teacher Question Timeline",
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
          categories: ["0", "1", "2", "3"],
        },
        tooltip: {
          enabled: true,
          custom: function ({ seriesIndex, dataPointIndex, w }) {
            //because 6 init entries
            let tooltipIndex = dataPointIndex - 6;
            let questionList = categorizedQuestions;
            let question = questionList[tooltipIndex];
            return (
              '<div class="arrow_box">' +
              "<span><strong>Speaker " +
              question.speaker +
              ": </strong>" +
              question.text +
              "</span><br>" +
              "<span>" +
              convertMsToTime(question.start) +
              "-" +
              convertMsToTime(question.end) +
              "</span>" +
              "</div>"
            );
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
