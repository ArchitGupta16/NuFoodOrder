import React, { useState, useEffect } from 'react'

// import { CONST } from "config"
// import { authController, serviceController } from "services/http"
// import { CredentialsLoginForm } from "components/forms"
import { useNavigate } from 'react-router-dom'
import CredentialsResetForm from 'components/forms/resetForm'
import './ResetPassword.css'

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


    const onSuccessReset = function ({data}) {
        let sid = data

        if (!sid) {
            let error = "An error occurred during the reset process"
            console.log(error)
            setMessageError(error)
            return
        }
        navigate("/login")
    }

    return (
        <div className='rs-pass'>
            <section className='login-card rs-pass'>

                <h2 className='mb-3'>Reset Password</h2>

                <CredentialsResetForm
                    onSubmit={onSuccessReset}
                    messageError={messageError}
                />
            </section>
        </div>
    )
}


export default ResetPage