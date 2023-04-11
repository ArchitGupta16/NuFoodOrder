
import React, { useRef } from 'react'
import { useForm } from "react-hook-form"
import { ResetButton as ResetButton } from 'components/buttons'
import { EmailInput, PasswordInput, FullNameInput } from 'components/inputs'
import "./loginForm.css"
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {ToastConatiner, toast} from 'react-toastify'

function OtpForm({onSubmit}) {

    // const emailRef = useRef();
    // const sendOtp = async () => {
    //     try {
    //         // let url = "http://localhost:3000/api/v1/"
    //         let url = "http://localhost:3080/api/v1/sendEmail"
    //         let options = {
    //             method: "post",
    //             url: url,
    //             data: {email: emailRef.current.value}
    //         }
    //         let response = await axios(options)
    //         console.log(response)
    //         if (response.data.statusText == "Success"){
    //             toast.success("Login Successfully");
    //             toast.success(response.data.message)
    //             // localStorage.setItem("token", response.data.token)
    //             // setTimeout{()=>{
    //             //     history.pushState('/home')
    //             // }, 1500}
    //         }else {
    //             toast.error(response.data.message);
    //         }
    //     }catch (e) {
    //         toast.error("Something went wrong");
    //     }
    // }

    let navigate = useNavigate()

    const MAX_LENGTH_OTP = 5
    const MAX_LENGTH_PASSWORD = 64

    const formSchema = Yup.object().shape({
        otp: Yup.string()
            .required('OTP is mandatory'),
            // .maxLength(MAX_LENGTH_OTP),
        password: Yup.string()
            .required('Password is mandatory')
            .min(8, 'Password require at least 8 characters'),
        passwordConfirmation: Yup.string()
            .required('Password confirmation is mandatory')
            .oneOf([Yup.ref('password')], 'Passwords does not match'),
    })
      
    const formOptions = { resolver: yupResolver(formSchema) }
    const { register, handleSubmit, formState: { errors }, setError } = useForm(formOptions)

    const handleFailRegister = function ({response}) {
        let { error } = response.data
        error.otp && setError("otp", { message: error.otp }, { shouldFocus: true })
        error.password && setError("password", { message: error.password }, { shouldFocus: true })
    }

    const handleSuccessRegister = function () {
        navigate("/login")
    }

    const handleOtpUser = (e) => {
        e.preventDefault()

        handleSubmit((userInformation) => {
            onSubmit(userInformation)
                .then(handleSuccessRegister)
                .catch(handleFailRegister)
        })(e)
    }

    return (
        <form onSubmit={handleOtpUser}>
            <div className='sign-form'>
                <FullNameInput
                    onRegister={register("otp", {required: true})}
                    inputName="otp"
                    label="OTP"
                    placeholder="Enter your OTP"
                    className={errors.otp ? 'is-invalid' : ''}
                    errorMessage={errors.otp?.message}
                    maxLength={MAX_LENGTH_OTP}
                />
                <PasswordInput
                    onRegister={register("password", {required: true})}
                    inputName="password"
                    label="Password"
                    placeholder="Enter your password"
                    className={errors.password ? 'is-invalid' : ''}
                    errorMessage={errors.password?.message}
                    maxLength={MAX_LENGTH_PASSWORD}
                />
                <PasswordInput
                    onRegister={register("passwordConfirmation", {required: true})}
                    inputName="passwordConfirmation"
                    label="Confirm password"
                    placeholder="Confirm your password"
                    className={errors.passwordConfirmation ? 'is-invalid' : ''}
                    errorMessage={errors.passwordConfirmation?.message}
                    maxLength={MAX_LENGTH_PASSWORD}
                />

                <ResetButton
                    textContent={"Reset Password"} 
                    // onClick={sendOtp}
                />
            </div>
        </form>
        
    )
}


export default OtpForm
