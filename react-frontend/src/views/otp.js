import React from 'react'
import { LinkButton } from 'components/buttons'
import { authController } from "services/http"
import './registerPage.css'
// import {RegisterForm} from 'components/forms'
import OtpForm from 'components/forms/otpForm'

function OtpPage() {

    // const registerUser = function (credentials) {
    //     return authController.registerUser(credentials)
    // }
    
    return (            
        <div className='signup-page'>
            <div className='signup-form'>
                <h2 className='mb-3'>Reset Password</h2>
                <OtpForm/>
                {/* <RegisterForm/> */}
                {/* <LinkButton route={"/login"} previousText="Have an account yet?" linkText="Sign in"/> */}
            </div>
        </div>
    )
}


export default OtpPage