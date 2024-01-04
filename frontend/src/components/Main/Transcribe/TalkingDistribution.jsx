import Chart from "react-apexcharts";
import { convertMsToTime } from "../../../utils/convertMsToTime";

export default function TalkingDistribution({ series }) {
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
