import TextField from "@mui/material/TextField";

export default function YoutubeUpload({ setYoutubeUrl, isAnalyzing }) {
  const handleOnBlur = (event) => {
    setYoutubeUrl(event.target.value);
  };

  return (
    <div>
      <h4>Please paste a YouTube Link to be transcribed and analyzed</h4>

      <TextField
        variant="outlined"
        label="YouTube Link"
        fullWidth
        onBlur={handleOnBlur}
        disabled={isAnalyzing}
      />
    </div>
  );
}
