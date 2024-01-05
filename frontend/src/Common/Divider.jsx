import Wave from "react-wavify";

export default function Divider() {
  return (
    <Wave
      fill="#09283D"
      paused={false}
      style={{ display: "flex" }}
      options={{
        height: 20,
        amplitude: 20,
        speed: 0.3,
        points: 7,
      }}
    />
  );
}
