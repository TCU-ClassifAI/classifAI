import React, { Component } from 'react'
import '../Login/login.css'
import '../Login/landing.css'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Auth } from 'aws-amplify'
import { NavItem } from 'react-bootstrap'
import signOut from '../SignOut/signOut'
import { faCheckCircle, faDatabase, faCogs, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


const LogIn = () => {
    let navigate = useNavigate();
    const [badSignIn, setBadSignIn]  = useState(false);
    const [user, setUser] = useState({
        username: '',
        password: ''
    })

    const handleInputChange = (event, keyName) => {
        event.persist();
        setUser((user) => {
            return {...user, [keyName]: event.target.value}
        })
    }

    async function signIn(event) {
        event.preventDefault();
        try{
            const test = await Auth.signIn({username: user.username, password: user.password});
            console.log(test);
            setBadSignIn(false);
            navigate("/home/transcribe")
        }catch(error){
            setBadSignIn(true);
            console.log(error)
        }
    }

    function learnMore(event) {
        event.preventDefault();
        navigate("/about")
    }

    return (
        <div className='container'>
            <div className='left-side'>
                <div className='logo-container'>
                <img src='../static/media/logo.18646aa75a5b064f6546.jpg' alt="Logo" /> 
                {/*<p with working directory */}
                </div>
                <div className='welcome-message'>
                    <h3>Welcome to ClassifAI</h3>
                    <p>A Machine Learning Approach to Enhancing Student Engagement</p>
                </div>
                <div className='additional-info'>
                    <div className='feature'>
                        <FontAwesomeIcon icon={faCheckCircle} />
                        <p>Easy and Secure Login</p>
                    </div>
                    <div className='feature'>
                        <FontAwesomeIcon icon={faDatabase} />
                        <p>Automatic Transcription and Categorization</p>
                    </div>
                    <div className='feature'>
                        <FontAwesomeIcon icon={faCogs} />
                        <p>Customizable AI Settings</p>
                    </div>
                </div>
                <div id="container">
                    <button class="learn-more">
                        <span class="circle" aria-hidden="true">
                        <span class="icon arrow"></span>
                        </span>
                        <span class="button-text" onClick={(e) => learnMore(e)}>Learn More</span>
                    </button>
                </div>

            </div>
            <div className="right-side">
                <form id='login-form'>
                <h2 id='title'>Log In</h2>
                <div className="form-group">
                    <label>Email address</label>
                    <div className='input-login'>
                        <input 
                        type="email" 
                        className="form-control" 
                        id="exampleInputEmail1" 
                        aria-describedby="emailHelp" 
                        placeholder="Enter email"
                        value={user.username}
                        onChange={(e) => handleInputChange(e, 'username')}/>
                    </div>
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <div className='input-login'>
                        <input 
                        type="password" 
                        className="form-control" 
                        placeholder="Enter password"
                        value={user.password}
                        onChange={(e) => handleInputChange(e, 'password')}/>
                    </div>
                    {badSignIn ? (
                        <div className='alert alert-danger' id='password-alert'>Username or password is incorrect</div>
                    ): null}
                </div>
                <button 
                className="btn btn-primary" 
                id='submit-login'
                onClick={(e) => signIn(e)}
                >Log In
                </button>
                {/* <button className="nav-link text-light" onClick={(e) => signOut(e)} id='sign-out'>Check</button> */}
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
}
export default LogIn;
