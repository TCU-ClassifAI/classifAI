import TextField from '@mui/material/TextField';

export default function YoutubeUpload({
    setYoutubeUrl,
}) {

    const handleOnBlur = (event) => {
        setYoutubeUrl(event.target.value)
    }; 

    return (
        <div>
        <h4>Please paste a Youtube Link to be transcribed and analyzed</h4>

        <TextField variant="outlined" label="Youtube Link"  fullWidth onBlur={handleOnBlur}/>

        </div>
    )
}