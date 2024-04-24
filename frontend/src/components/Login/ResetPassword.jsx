import React, { useState } from 'react';
import { Auth } from 'aws-amplify';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import styles from "./reset.module.css"
import { Link } from 'react-router-dom'; 

export default function ResetPassword() {
    const [resetPasswordEmail, setResetPasswordEmail] = useState('');
    const [resetPasswordCode, setResetPasswordCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmationCodeSent, setConfirmationCodeSent] = useState(false);
    const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);

    const handleResetPassword = async (event) => {
        event.preventDefault();
        try {
            await Auth.forgotPassword(resetPasswordEmail);
            setConfirmationCodeSent(true);
        } catch (error) {
            console.log(error);
        }
    };

    const handleConfirmResetPassword = async (event) => {
        event.preventDefault();
        try {
            await Auth.forgotPasswordSubmit(resetPasswordEmail, resetPasswordCode, newPassword);
            setPasswordResetSuccess(true);
        } catch (error) {
            console.log(error);
        }
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
                    {confirmationCodeSent ? (
                        <form onSubmit={handleConfirmResetPassword}>
                            <p>Please check your email for the confirmation code.</p>
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
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
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
                                Reset Password
                            </Button>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}
