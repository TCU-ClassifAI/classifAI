import React from 'react';
import './login.css';
import './landing.css';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Auth } from 'aws-amplify';
import logo from '../../images/frogv2.png';
import { faCheckCircle, faDatabase, faCogs} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function Login(){
    let navigate = useNavigate();
    const [badSignIn, setBadSignIn]  = useState(false);
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [user, setUser] = useState({
        username: '',
        password: '',
        showPassword: false
    });

    const handleInputChange = (event, keyName) => {
        event.persist();
        setUser((user) => {
            return {...user, [keyName]: event.target.value}
        });
    };

    const handleClickShowPassword = () => {
        setUser((user) => ({
            ...user,
            showPassword: !user.showPassword
        }));
    };

    async function signIn(event) {
        event.preventDefault();
        try{
            const test = await Auth.signIn({username: user.username, password: user.password});
            console.log(test);
            setBadSignIn(false);
            navigate("/home/analyze");
        }catch(error){
            setBadSignIn(true);
            setShowResetPassword(true); // Show reset password button on bad login
            console.log(error);
        }
    }

    async function handleResetPassword(event) {
        event.preventDefault();
        navigate("/resetPassword");
    }

    function learnMore(event) {
        event.preventDefault();
        navigate("/");
    }

    return (
        <div className='container'>
            <div className='left-side'>
                <div className='logo-container'>
                    <img src={logo} alt="Logo" /> 
                </div>
                <div className='welcome-message'>
                    <h3>Welcome to ClassifAI</h3>
                    <p>A Machine Learning Approach to Enhancing Student Engagement</p>
                </div>
                <div className='additional-info'>
                    <div className='feature'>
                        <FontAwesomeIcon icon={faCheckCircle} className='icon' />
                        <p>Easy and Secure Login</p>
                    </div>
                    <div className='feature'>
                        <FontAwesomeIcon icon={faDatabase} className='icon'/>
                        <p>Automatic Transcription and Categorization</p>
                    </div>
                    <div className='feature'>
                        <FontAwesomeIcon icon={faCogs} className="icon"/>
                        <p>Customizable AI Settings</p>
                    </div>
                </div>
                <div id="container">
                    <button className="learn-more">
                        <span className="circle" aria-hidden="true">
                            <span className="icon arrow"></span>
                        </span>
                        <span className="button-text" onClick={(e) => learnMore(e)}>Learn More</span>
                    </button>
                </div>
            </div>
            <div className="right-side">
                <form id='login-form'>
                    <h2 id='title'>Log In</h2>
                    <div className="form-group">
                        <div className='input-login'>
                            <TextField
                                variant='outlined'
                                label="Email Address"
                                type="email"
                                className="form-control"
                                id="exampleInputEmail1"
                                aria-describedby="emailHelp"
                                placeholder="Enter email"
                                value={user.username}
                                onChange={(e) => handleInputChange(e, 'username')}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <div className='input-login'>
                            <TextField
                                variant='outlined'
                                label='Password'
                                type={user.showPassword ? 'text' : 'password'}
                                className="form-control"
                                placeholder="Enter password"
                                value={user.password}
                                onChange={(e) => handleInputChange(e, 'password')}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={handleClickShowPassword}
                                            >
                                                {user.showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </div>
                        {badSignIn ? (
                            <div className='alert alert-danger' id='password-alert'>Username or password is incorrect</div>
                        ): null}
                    </div>
                    {showResetPassword && ( 
                        <div>
                            <button
                            className="btn btn-danger"
                            onClick={(e) => handleResetPassword(e)}
                        >
                            Reset Password
                        </button>
                        </div>// Render reset password button conditionally
                        
                    )}
                    <button
                        className="btn btn-primary"
                        id='submit-login'
                        onClick={(e) => signIn(e)}
                    >
                        Log In
                    </button>
                   
                    <div className="w-full">
                        <hr />
                        <p className="text-gray-700 pb-2 pt-2 text-sm">Don't have an account?</p>
                        <Link
                            to={{
                                pathname: '/signup'
                            }}
                            className="btn btn-success"
                        >
                            Register
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
};
