import { Auth } from 'aws-amplify';
import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import "./signUp.css"

const ConfirmRegister = () => {
  let navigate = useNavigate();
  const [user, setUser] = useState({ username: '', authenticationCode: '', });

  const handleInputChange = (event, keyName) => {
    event.persist();
    setUser((user) => {
      return { ...user, [keyName]: event.target.value }
    })
  }

  async function confirmSignUp (event){
    event.preventDefault();
    try {
      await Auth.confirmSignUp(user.username, user.authenticationCode);
      console.log('success confirm sign up');
      navigate('/home')
    } catch (error) {
      console.log('error', error);
    }
  }

  return (
    <div className='container'>
      <form className="row g-3" id="signup-form">
        <h3>Confirm Sign-Up</h3>
        <small>Check the email used to sign up for a confirmation code</small>
          <div className="col-md-6">
              <label htmlFor="inputEmail4" className="form-label">Email</label>
              <input 
              type="email" 
              className="form-control" 
              id="inputEmail4" 
              value={user.username} 
              placeholder="Email"
              onChange={(e) => handleInputChange(e, 'username')}/>
          </div>
          <div className="col-md-6">
              <label htmlFor="inputAddress" className="form-label">Confirmation Code</label>
              <input 
                type="text"
                className="form-control" 
                id="inputEmail4" 
                value={user.authenticationCode} 
                placeholder="Auth Code"
                onChange={(e) => handleInputChange(e, 'authenticationCode')}/>
          </div>
          <div className="col-12">
              <button
              className='btn btn-primary'
              onClick={(e) => confirmSignUp(e)}
              >
                Confirm Sign Up
              </button>
          </div>
          <div>
          <Link
            to={{
              pathname: '/signup'
            }}
            className="pt-2 text-sm text-blue-500 hover:text-blue-600"
          >
            Back
          </Link>
        </div>
        </form>
    </div>
  )
}

export default ConfirmRegister;
