import TextField from '@mui/material/TextField';

export default function YoutubeUpload({
    youtubeUrl, 
    setYoutubeUrl
}) {

    const handleOnBlur = (event) => {
        setYoutubeUrl(event.target.value)
    }; 

    return (
        <>
        <TextField variant="outlined" label="Youtube Link"  onBlur={handleOnBlur}/>

        </>
    )
}