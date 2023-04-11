import { useState } from "react"
import { LoginPage, RegisterPage, HomePage, SuccessLoginPage} from 'views'
import LaunchPage from "views/LaunchPage"
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import logo from "assets/logo.svg"
import ResetPage from "views/ResetPassword"
import OtpPage from "views/otp"

function Footer() {
    return (
        <footer>
            <small>Powered by NU</small>
            <img src={logo} className="App-logo" alt="logo" />
        </footer>
    )
}

function App() {

    let [loggedIn, setLoggedIn] = useState(null)
    
    function handleLogin(){
        setLoggedIn(true)
    }
    function handleLogout(){
        setLoggedIn(false)
    }

    return (
        <div className='App-body'>
            <BrowserRouter>
                <Routes>
                    <Route index element={<LaunchPage />} />
                    {/* <Route path="/" element={<LaunchPage />} /> */}
                    <Route path="login" element={<LoginPage handleLogin={handleLogin}/>} />
                    <Route path="login/success" element={<SuccessLoginPage/>} />
                    <Route path="register" element={<RegisterPage/>} />
                    <Route path="home" element={ !loggedIn ? <Navigate to={"/login"} /> : <HomePage handleLogout={handleLogout}/>} />
                    <Route path="resetPassword" element={<ResetPage/>}/>
                    <Route path="otp" element={<OtpPage/>}/>
                    <Route path="*" element={<h1>404 Not found</h1>} />
                </Routes>
            </BrowserRouter>
            <Footer />
        </div>
    )
}

export default App
