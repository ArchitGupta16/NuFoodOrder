import React from 'react'
import './LaunchPage.css'
import { Navigate, useNavigate } from 'react-router-dom'
import { LinkButton } from 'components/buttons'

function LaunchPage () {

    let navigate = useNavigate()


    return (
        <div className="App-body launch-page">
            <div className="header">
                <LinkButton route={"/login"} linkText="Login"/>
                <LinkButton route={"/register"} linkText="Sign up"/>
            </div>
            <h1 className="branch-name">NuOrder</h1>
        </div>
    )
}

export default LaunchPage