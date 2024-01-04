import Chart from "react-apexcharts";

export default function TeacherQuestionTimeline( {options, series}) {
    return (
        <>
            <div className="card-deck mb-3 text-center">
                <table>
                  <tbody>
                    <tr>
                      <td id="timeChartContainer">
                        <Chart
                          options={options}
                          series={series}
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
    )
}