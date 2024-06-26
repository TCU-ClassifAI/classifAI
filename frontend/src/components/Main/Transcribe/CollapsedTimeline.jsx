import Chart from "react-apexcharts";
import { convertMsToTime } from "../../../utils/convertMsToTime";

export default function CollapsedTimeline({
  sentences,
  labelColors,
}) {
  function setTimeLineData() {
    if (sentences) {
      let timeData = [];
      let questionList = sentences.filter(
        (item) =>
          item.isQuestion && Object.keys(labelColors).includes(item.label)
      );
      const minTime = Math.min(...sentences.map((s) => s.start / 1000));
      const maxTime = Math.max(...sentences.map((s) => s.start / 1000));
      const totalTimeRange = maxTime - minTime;
      const entryWidthPercentage = 0.04;
      const constantWidth = totalTimeRange * entryWidthPercentage;

      let initialEntry = {
        x: "Questions",
        y: [0, maxTime],
        fillColor: "#FFFFFF",
      };
      timeData.push(initialEntry);

      for (let i = 0; i < questionList.length; i++) {
        if (labelColors.hasOwnProperty(questionList[i].label)) {
          let endTime;
          if (i < questionList.length - 1) {
            endTime = Math.min(
              questionList[i + 1].start / 1000,
              questionList[i].start / 1000 + constantWidth
            );
          } else {
            endTime = questionList[i].start / 1000 + constantWidth;
          }
          let entry = {
            x: "Questions",
            y: [questionList[i].start / 1000, endTime],
            fillColor: labelColors[questionList[i].label],
          };
          timeData.push(entry);
        }
      }
      return timeData;
    }
  }

  function getTimeLineProps(sentences) {
    return {
      series: [
        {
          data: setTimeLineData(),
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
            let questionList = sentences.filter((item) => item.isQuestion);

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
      <table>
        <tbody>
          <tr>
            <td id="timeLineContainer">
              <Chart
                options={getTimeLineProps(sentences).options}
                series={getTimeLineProps(sentences).series}
                type="rangeBar"
                height={200}
                width={1400}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
