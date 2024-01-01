import Chart from "react-apexcharts";

export default function questionCategoryDistribution({ labeledQuestions }) {
  function getAmountOfLabel(label) {
    let amount = 0;
    if (labeledQuestions) {
      for (let i = 0; i < labeledQuestions.length; i++) {
        if (labeledQuestions[i].label === label) {
          amount++;
        }
      }
      return amount;
    }
  }

  const barChartProps = {
    options: {
      title: {
        text: "Question Category Distribution",
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
          "Knowledge",
          "Understand",
          "Apply",
          "Analyze",
          "Evaluate",
          "Create",
          "Uncategorized",
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
            x: "Knowledge",
            y: getAmountOfLabel("Knowledge"),
            fillColor: "#0000FF",
            strokeColor: "#000000",
          },
          {
            x: "Understand",
            y: getAmountOfLabel("Understand"),
            fillColor: "#D42AC8",
            strokeColor: "#C23829",
          },
          {
            x: "Apply",
            y: getAmountOfLabel("Apply"),
            fillColor: "#009400",
            strokeColor: "#C23829",
          },
          {
            x: "Analyze",
            y: getAmountOfLabel("Analyze"),
            fillColor: "#FF7300",
            strokeColor: "#C23829",
          },
          {
            x: "Evaluate",
            y: getAmountOfLabel("Evaluate"),
            fillColor: "#FFC400",
            strokeColor: "#000000",
          },
          {
            x: "Create",
            y: getAmountOfLabel("Create"),
            fillColor: "#7C7670",
            strokeColor: "#C23829",
          },
          {
            x: "Uncategorized",
            y: getAmountOfLabel("Uncategorized"),
            fillColor: "#FF0000",
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
