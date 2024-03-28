import './signUp.css';
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Auth } from "aws-amplify";
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function SignUp() {
    let navigate = useNavigate();
    const [badState, setBadState] = useState()
    const [badGrade, setBadGrade] = useState()
    const [badZip, setBadZip] = useState()
    const [badUserOrEmail, setBadUserOrEmail] = useState()
    const [showPassword, setShowPassword] = useState(false);
    const [user, setUser] = useState({
        name: '',
        username: '',
        password: '',
        school: '',
        grade_level: '',
        zip: '',
        state: '',
        authCode: '',
    })

    const handleInputChange = (event, keyName) => {
        event.persist();
        setUser((user) => {
            return {...user, [keyName]: event.target.value}
        })
    }

    function checkState(){
        const states = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','District of Columbia','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming']
        if(states.includes(user.state)){
            return true
        }else{
            setBadState(true)
            return false
        }
    }

    function checkGrade(){
        const grades = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
        if(grades.includes(user.grade_level)){
            return true
        }else{
            setBadGrade(true)
            return false
        }
    }

    function checkZip(){
        if(user.zip.length < 5 || isNaN(user.zip)){
            setBadZip(true)
            return false
        }else{
            return true
        }
    }

    async function signUp(event){
        event.preventDefault();
        var goodState = checkState();
        var goodGrade = checkGrade();
        var goodZip = checkZip();

        if(goodState && goodGrade && goodZip){
            try{
                await Auth.signUp({
                    username: user.username,
                    password: user.password,
                    attributes: {
                        name: user.name,
                        email: user.username,
                        'custom:school': user.school,
                        'custom:grade_level': user.grade_level,
                        'custom:zip': user.zip,
                        'custom:state': user.state,
                    },
                        autoSignIn: {
                            enabled: true,
                        }
                });
                navigate('/confirmSignUp')
            }catch(error){
                setBadUserOrEmail(true)
                console.log(error)
            }
        }
    }

    return(
        <div className="container">
            <form className="row g-3" id="signup-form">
            {badUserOrEmail ? (
                    <div>
                        <div className='alert alert-danger'>Email or Password invalid. Password must be 8 characters with uppercase, lowercase, numbers, and symbols</div>
                    </div>
                ): null}
            {badState ? (
                    <div>
                        <div className='alert alert-danger'>Please enter state in correct format. E.g. Texas, Hawaii, California,etc.</div>
                    </div>
                ): null}
            {badGrade ? (
                    <div>
                        <div className='alert alert-danger'>Please enter grade level in correct format. E.g. K, 1, 2, 3, etc.</div>
                    </div>
                ): null}
             {badZip ? (
                    <div>
                        <div className='alert alert-danger'>Please enter zipcode in correct format. Must include 5 digits </div>
                    </div>
                ): null}
                <div className="col-md-6">
                <TextField
                        label="Name*"
                        variant="outlined"
                        fullWidth
                        value={user.name}
                        placeholder="Name"
                        onChange={(e) => handleInputChange(e, 'name')}
                    />
                </div>
                <div className="col-md-6">
                <TextField
                        label="Email*"
                        fullWidth
                        variant="outlined"
                        value={user.username}
                        placeholder="Enter Email"
                        onChange={(e) => handleInputChange(e, 'username')}
                    />
                </div>
                <div className="col-md-4">
                    <TextField
                        fullWidth
                        variant="outlined"
                        label="School"
                        value={user.school}
                        placeholder="School"
                        onChange={(e) => handleInputChange(e, 'school')}
                    />
                </div>
                <div className="col-md-4">
                    <TextField
                        fullWidth
                        variant="outlined"
                        label="Grade Level*"
                        value={user.grade_level}
                        placeholder="Grade Level (e.g. K, 1, ..., 12)"
                        onChange={(e) => handleInputChange(e, 'grade_level')}
                    />
                </div>
                <div className="col-md-4">
                    <TextField
                        fullWidth
                        variant="outlined"
                        label='State*'
                        value={user.state}
                        placeholder="State"
                        onChange={(e) => handleInputChange(e, 'state')}
                    />
                </div>
                <div className="col-md-6">
                    <TextField
                        fullWidth
                        variant="outlined"
                        label="Zip Code"
                        value={user.zip}
                        placeholder="Zip Code"
                        onChange={(e) => handleInputChange(e, 'zip')}
                    />
                </div>
                <div className="col-md-6">
                    <TextField
                        fullWidth
                        variant="outlined"
                        label="Password*"
                        type={showPassword ? 'text' : 'password'}
                        value={user.password}
                        placeholder="Password"
                        onChange={(e) => handleInputChange(e, 'password')}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </div>
                <div className="col-12">
                    <button type="submit" className="btn btn-primary" onClick={(e) => signUp(e)}>Sign Up</button>
                </div>
                <div className="w-full">
                    <hr />
                    <p className="text-gray-700 pb-2 pt-2 text-sm">You already have an account?</p>
                    <Link
                        to={{
                        pathname: '/login'
                        }}
                        className="btn btn-success"
                    >
                        Log in
                    </Link>
                </div>
            </form>
        </div>
    )
}

