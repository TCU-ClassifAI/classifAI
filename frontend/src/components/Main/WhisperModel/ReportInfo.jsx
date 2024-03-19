import React from 'react';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';

export default function ReportInfo({
    gradeLevel,
    subject,
    reportName,
    setGradeLevel,
    setSubject,
    setReportName,
    setChangeAlert
}) {
    const handleReportNameChange = (event) => {
        setReportName(event.target.value);
        setChangeAlert(true);
    };

    const handleGradeLevelChange = (event) => {
        setGradeLevel(event.target.value);
        setChangeAlert(true);
    };

    const handleSubjectChange = (event) => {
        setSubject(event.target.value);
        setChangeAlert(true);
    };

    return (
        <>
        <div>
        <Grid container spacing={2}>
            <Grid item xs={4}>
                <TextField 
                    variant="outlined" 
                    label="Report Name (optional)" 
                    fullWidth 
                    defaultValue={reportName}
                    onBlur={handleReportNameChange} // Update on blur
                />
            </Grid>
            <Grid item xs={4}>
                <TextField 
                    variant="outlined" 
                    label="Grade Level (optional)" 
                    fullWidth 
                    defaultValue={gradeLevel}
                    onBlur={handleGradeLevelChange} // Update on blur
                />
            </Grid>
            <Grid item xs={4}>
                <TextField 
                    variant="outlined" 
                    label="Subject (optional)" 
                    fullWidth 
                    defaultValue={subject}
                    onBlur={handleSubjectChange} // Update on blur
                />
            </Grid>
        </Grid>
        </div>
        
        </>
    );
}
