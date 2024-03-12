import TextField from '@mui/material/TextField';

export default function YoutubeUpload({
    setYoutubeUrl,
}) {

    const handleOnBlur = (event) => {
        setYoutubeUrl(event.target.value)
    }; 

    return (
        <div>
        <TextField variant="outlined" label="Youtube Link"  onBlur={handleOnBlur}/>

        </div>
    )
}