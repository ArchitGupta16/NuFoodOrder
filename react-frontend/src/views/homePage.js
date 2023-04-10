import React, { useEffect, useState } from 'react'
import { LogoutButton } from 'components/buttons'
import { usersController } from 'services/http'
import "./homePage.css"
import { useNavigate } from 'react-router-dom'
import { Form } from 'react-bootstrap'


function Spinner() {
    return (
        <div className="d-flex flex-column align-items-center">
            <span className="spinner-border text-primary mb-3" role="status" aria-hidden="true"></span>
            Loading...
        </div>
    )
}

function UserInformation ({user}) {
    return (
        <div className='d-flex align-items-center mb-5'>
            {
                user.picture &&
                <img src={user.picture} className="avatar shadow me-2"/>
            }
            <div className='d-flex flex-column'>
                <strong>{user.fullname || user.login}</strong>
                <small>{user.email}</small>
            </div>
        </div>
    )
}

function Navbar({ brandName, profileIcon }) {
    return (
        <nav className="navbar navbar-expand-lg bg-light box-shadow">
            <div className="container-fluid">
                <a className="navbar-brand" href="/">
                    {brandName}
                </a>
                <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <a className="nav-link" href="/">
                                <img src={profileIcon} alt="Profile" width="32" height="32" />
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    )
}
  

function HomePage({handleLogout}) {

    const [ userInformation, setUserInformation ] = useState(null)

    let navigate = useNavigate()

    useEffect(() => {
        let sid = localStorage.getItem("sid")
        sid = JSON.parse(sid)
        let { id, providerId } = sid
        usersController.getUserById(id, providerId)
            .then(({data}) => {
                if (!data || data === "") {
                    logout()
                }
                console.log(data)
                setUserInformation(data)
            })
            .catch(error => {
                console.error(error)
                logout()
            })

    }, [])


    const logout = () => {
        handleLogout()
        localStorage.removeItem("sid")
        navigate("/")
    }

    if (!userInformation) {
        return <Spinner />
    }

    return (
        
        <div className="home-wel">
            <Navbar brandName="NuOrder" profileIcon="/path/to/profile/icon.png" />
            <form>
                <div>
                    <h1 className="mb-5">Welcome!</h1>
                    <UserInformation user={userInformation} />
                    <LogoutButton textContent={'Logout'} onClick={logout} />
                </div>
            </form>
        </div>
                
    )
}   


export default HomePage