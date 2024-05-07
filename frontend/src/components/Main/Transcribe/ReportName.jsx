export default function ReportName({
  setReportName,
  userReportToLoad,
}) {
  function handleInputChange(event) {
    event.persist();
    setReportName(event.target.value);
  }
  return (
    <>
      {!userReportToLoad ? (
        <input
          placeholder="Name this report"
          onBlur={handleInputChange}
          id="name-report"
        ></input>
      ) : null}
    </>
  );
}
