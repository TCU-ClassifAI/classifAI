export default function ReportName({
  badReportName,
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
      {badReportName ? (
        <div className="alert alert-danger">
          Please name your report before saving!
        </div>
      ) : null}
    </>
  );
}
