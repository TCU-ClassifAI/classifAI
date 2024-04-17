import React from 'react';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

export default function ReportInfo({
    gradeLevel,
    subject,
    reportName,
    dateTime,
    setGradeLevel,
    setSubject,
    setReportName,
    setChangeAlert,
    setDateTime
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

    const handleDateTimeChange = (value) => {
        setDateTime(value);
        setChangeAlert(true);
    }

    return (
        <>
            <div>
                <Grid container spacing={2}>
                    <Grid item xs={3}>
                        <TextField 
                            variant="outlined" 
                            label="Report Name (optional)" 
                            fullWidth 
                            defaultValue={reportName}
                            onBlur={handleReportNameChange} // Update on blur
                        />
                    </Grid>
                    <Grid item xs={3} style={{ marginTop: 7, paddingTop: 0 }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DemoContainer components={['DateTimePicker']}>
                                <DateTimePicker 
                                    label="Audio Date and Time"
                                    value={dateTime} // Set value from dateTime state
                                    onChange={(value) => handleDateTimeChange(value)}
                                    ampm={false}
                                />
                            </DemoContainer>
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={3}>
                        <TextField 
                            variant="outlined" 
                            label="Subject (optional)" 
                            fullWidth 
                            defaultValue={subject}
                            onBlur={handleSubjectChange} // Update on blur
                        />
                    </Grid>
                    <Grid item xs={3}>
                        <TextField 
                            variant="outlined" 
                            label="Grade Level (optional)" 
                            fullWidth 
                            defaultValue={gradeLevel}
                            onBlur={handleGradeLevelChange} // Update on blur
                        />
                    </Grid>
                </Grid>
            </div>
        </>
    );
}
