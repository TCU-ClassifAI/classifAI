import React, { useState } from 'react';
import { Auth } from 'aws-amplify';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import styles from "./reset.module.css"
import { Link } from 'react-router-dom'; 

export default function ResetPassword() {
    const [resetPasswordEmail, setResetPasswordEmail] = useState('');
    const [resetPasswordCode, setResetPasswordCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmationCodeSent, setConfirmationCodeSent] = useState(false);
    const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleResetPassword = async (event) => {
        event.preventDefault();
        try {
            await Auth.forgotPassword(resetPasswordEmail);
            setConfirmationCodeSent(true);
            setError(null); // Clear any previous errors
        } catch (error) {
            const msg = error.message + " Please try again."
            setError(msg);
        }
    };

    const handleConfirmResetPassword = async (event) => {
        event.preventDefault();
        try {
            await Auth.forgotPasswordSubmit(resetPasswordEmail, resetPasswordCode, newPassword);
            setPasswordResetSuccess(true);
            setError(null); // Clear any previous errors
        } catch (error) {
            const msg = error.message + " Please try again."
            setError(msg);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className={styles.container}>
            <h4>Password Reset</h4>
            {passwordResetSuccess ? (
                <div>
                    <p>Password reset successfully!</p>
                    <p>You can now log in with your new password.</p>
                    <Link to="/login" className="btn btn-success">Return to Login</Link>
                </div>
            ) : (
                <div>
                    {error && <Alert severity="error">{error}</Alert>}
                    <div>Password must be 8 characters with uppercase, lowercase, numbers, and symbols.</div>
                    <br />
                    {confirmationCodeSent ? (
                        <form onSubmit={handleConfirmResetPassword}>
                            <p>Please check your email for the confirmation code.</p>
                            <p>Please check your spam folder if no code is sent.</p>
                            <TextField
                                label="Confirmation Code"
                                variant="outlined"
                                fullWidth
                                value={resetPasswordCode}
                                onChange={(e) => setResetPasswordCode(e.target.value)}
                                required
                            />
                            <TextField
                                label="New Password"
                                variant="outlined"
                                fullWidth
                                type={showPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={togglePasswordVisibility}
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                            <Button type="submit" variant="contained" color="primary">
                                Confirm Reset Password
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword}>
                            <TextField
                                label="Email Address"
                                variant="outlined"
                                fullWidth
                                value={resetPasswordEmail}
                                onChange={(e) => setResetPasswordEmail(e.target.value)}
                                required
                            />
                            <Button type="submit" variant="contained" color="primary">
                                Send Confirmation Code
                            </Button>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}
