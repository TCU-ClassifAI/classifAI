import Chart from "react-apexcharts";
import { convertMsToTime } from "../../../utils/convertMsToTime";

export default function TalkingDistribution({ transcription, teacher }) {
  function getSpeakingTime(speakerName) {
    let speakingTime = 0;
    for (let i = 0; i < transcription.length; i++) {
      if (transcription[i].speaker === speakerName) {
        speakingTime += transcription[i].end_time - transcription[i].start_time;
      }
    }
    return speakingTime;
  }

  function sumSpeakingTime() {
    let totalTime = 0;
    for (let i = 0; i < transcription.length; i++) {
      totalTime += transcription[i].end_time - transcription[i].start_time;
    }
    return totalTime;
  }

  function totalSpeakers() {
    let speakerList = [];
    for (let i = 0; i < transcription.length; i++) {
      if (!speakerList.includes(transcription[i].speaker)) {
        speakerList.push(transcription[i].speaker);
      }
    }
    return speakerList;
  }

  function getNonSpeakingTime() {
    return (
      transcription[transcription.length - 1].end_time -
      transcription[0].start_time -
      sumSpeakingTime()
    );
  }

  function buildTalkingDistributionSeries() {
    return [
      getSpeakingTime(teacher),
      sumSpeakingTime() - getSpeakingTime(teacher),
      getNonSpeakingTime(),
    ];
  }

  const series = buildTalkingDistributionSeries();
  const pieChartProps = {
    options: {
      title: {
        text: "Talking Distribution",
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
        formatter: function (val, opts) {
          const label = opts.w.config.labels[opts.seriesIndex];
          return `${label}: ${val.toFixed(1)}%`;
        },
        style: {
          fontSize: "18px",
          fontFamily: "Helvetica, Arial, sans-serif",
          fontWeight: "bold",
        },
      },
      tooltip: {
        enabled: true,
        y: {
          formatter: function (
            value,
            { series, seriesIndex, dataPointIndex, w }
          ) {
            const ms = value;
            return convertMsToTime(ms);
          },
        },
      },
      labels: ["Teacher", "Students", "Non-Speaking"],
    },
    series: series,
  };

  return (
    <>
      <div className="card-deck mb-3 text-center">
        <table>
          <tbody>
            <tr>
              <td id="pieChartContainer">
                <Chart
                  options={pieChartProps.options}
                  series={pieChartProps.series}
                  type="pie"
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
