import React, { useState, useEffect } from 'react'

// import { CONST } from "config"
// import { authController, serviceController } from "services/http"
// import { CredentialsLoginForm } from "components/forms"
import { useNavigate } from 'react-router-dom'
import CredentialsResetForm from 'components/forms/resetForm'
import './ResetPassword.css'
import { authController } from "services/http"


function ResetPage({handleReset}) {

    let navigate = useNavigate()

    useEffect(() => {
        let isUserAuthenticated = localStorage.getItem("sid")
        if (isUserAuthenticated) {
            handleReset()
            return navigate("/home")
        }
        
    }, [])

    const [messageError, setMessageError] = useState("")

    const resetUser = function (credentials) {
        return authController.resetPassword(credentials)
    }

    // const onSuccessReset = function ({data}) {
    //     // let sid = data

    //     // if (!sid) {
    //     //     let error = "An error occurred during the reset process"
    //     //     console.log(error)
    //     //     setMessageError(error)
    //     //     return
    //     // }
    //     navigate("/otp")
    // }

    return (
        <div className='rs-pass'>

            <section>
                {/* <h2><b>Reset Password</b></h2> */}

                <CredentialsResetForm
                    onSubmit={resetUser}
                    messageError={messageError}
                />
            </section>
        </div>
    )
}


export default ResetPage
