function AuthController(database, logger) {

    this.database = database
    this.logger = logger
    const nodemailer = require('nodemailer');
    const CONST = require("../utils/constants")
    const bcrypt = require("bcrypt")
    const DuplicatedEmailError = require("../utils/customErrors")
    const jwtUtil = require("../utils/jwt")
    const Otp = require('../models/otp');

    this.getUserSession = (request, response) => {
        const jwtToken = request.cookies.jwt
        let authData = jwtUtil.decodeJWT(jwtToken)
        response.json({ sid : authData })
    }

    this.login = async (request, response) => {
        const { email, password } = request.body
        try {
            const user = await this.database.getUserByEmail(email)
            if (!user) {
                const message = "Email not found"
                this.logger.info(`Login rejected [${email}]. ${message}`)
                return response.status(CONST.httpStatus.NOT_FOUND).json({ error: message })
            }
            const isValidPassword = await bcrypt.compare(password, user.password)
            if (!isValidPassword) {
                const message = "Wrong password"
                this.logger.info(`Login rejected [${email}]. ${message}`)
                return response.status(CONST.httpStatus.UNAUTHORIZED).json({ error: message })
            }
 
            const token = jwtUtil.generateJWT(user.id, user.email)
            response.cookie("jwt", token, { httpOnly: true, maxAge: CONST.maxAgeCookieExpired })
            this.logger.info(`Session started for user [${user.email}]`)
            
            let authData = {
                id: user.id
            }
            response.json({ sid: authData })
        } catch(error) {
            const message = `Imposible to login user: ${error}`
            this.logger.error(message)
            response.status(CONST.httpStatus.INTERNAL_ERROR).json({ error: message })
        }
    }

    this.register = async (request, response) => {
        const user = request.body

        try {
            const createdUser = await this.database.createUser(user)
            const token = jwtUtil.generateJWT(user.id, user.email)
            response.cookie("jwt", token, { httpOnly: true, maxAge: CONST.maxAgeCookieExpired })
            
            let authData = {
                id: createdUser.id, 
                providerId: null
            }
            response.status(CONST.httpStatus.CREATED).json({ sid : authData })
        } catch(error) {

            // Handled errors
            const validationErrors = handleRegisterValidationErrors(error)
            if (validationErrors) {
                return response.status(CONST.httpStatus.BAD_REQUEST).json({ error: validationErrors })
            }

            this.logger.error(error)
            const message = "Unable to register user"
            response.status(CONST.httpStatus.INTERNAL_ERROR).json({ error: message})
        }
    }

    this.oauthGithubLogin = async (request, response) => {
        const userProfile = {
            id: request.user.id,
            name: request.user._json.name || "",
            login: request.user._json.login,
            email: request.user._json.email,
            picture: request.user._json.avatar_url,
            provider: request.user.provider
        }
        let user = undefined
        try {
            user = await findOrCreateUserOAuth2(userProfile)
        } catch(error)  {
            this.logger.error(error)
            return response.redirect(process.env.FAILED_LOGIN_REDIRECT)
        }
        const token = jwtUtil.generateJWT(user.id, user.email, userProfile.id)
        response.cookie("jwt", token, { httpOnly: true, maxAge: CONST.maxAgeCookieExpired })
        response.redirect(process.env.SUCCESSFUL_LOGIN_REDIRECT)
    }

    this.oauthGoogleLogin = async (request, response) => {
        const userProfile = {
            id: request.user.id,
            name: request.user.displayName,
            email: request.user._json.email,
            picture: request.user._json.picture || null,
            provider: request.user.provider 
        }

        let user = undefined
        try {
            user = await findOrCreateUserOAuth2(userProfile)
        } catch(error)  {
            this.logger.error(error)
            return response.redirect(process.env.FAILED_LOGIN_REDIRECT)
        }
        const token = jwtUtil.generateJWT(user.id, user.email, userProfile.id)
        response.cookie("jwt", token, { httpOnly: true, maxAge: CONST.maxAgeCookieExpired })
        response.redirect(process.env.SUCCESSFUL_LOGIN_REDIRECT)
    }

    

    this.changePassword = async (req,res) => {
            let data = await Otp.find({email:req.body.email,code:req.body.otpCode});
            const response = {
                if (data){
                    let currentTime = new Date().getTime();
                    let diff = data.expireIn - currentTime;
                    if(diff<0){
                        response.message = 'Token Expired';
                        response.status = 'error';
                    }else{
                        let user = this.database.getUserByEmail(req.body.email);
                        user.password = req.body.password
                        user.save()
                        response.message = 'Password Changed';
                        response.status = 'Success';
                    }
                }
        }
    }

    this.emailSend = async (req,res) => {
        let data = await this.database.getUserByEmail(req.body.email);
        const response = {};
        console.log("email : ",data)
        
        if (data){
            let otpcode = Math.floor((Math.random()*10000+1));
            let otpData = new Otp({
                email: req.body.email,
                code: otpcode,
                expireIn: new Date().getTime() + 300*1000
            })
            let otpResponse = await otpData.save();
            // const link = `http://localhost:3000/api/v1/sendEmail/${otpResponse._id}`
            const link = `http://localhost:3000/api/v1/sendEmail`
            mailer(req.body.email,link);
            
            response.message = 'Mail sent'
            response.status = "Success"
            res.status(200).json(response)
            console.log("Success otp mail sent",otpResponse)
            console.log("Check Email");

        }
        else{
            response.message = 'Mail Not sent! Somthing went wrong';
            response.status = 'Failure';
            res.status(400).json(response)
            console.log("Error!!");
            console.log("Email not found")
        }
    }

    
    
    
    //#region Auxiliar methods
    const MONGOOSE_DUPLICATED_EMAIL_ERROR_CODE = 11000

    const handleRegisterValidationErrors = (err) => {
        let errors = {
            email: "",
            password: "",
            fullname: ""
        }
    
        if (err instanceof DuplicatedEmailError || err.code === MONGOOSE_DUPLICATED_EMAIL_ERROR_CODE) {
            errors.email = "That email is already registered"
            return errors
        }
    
        // Validations error
        if (err.message.includes("User validation failed")) {
            Object.values(err.errors).forEach(({properties}) => {
                errors[properties.path] = properties.message
            })
        }
    
        return errors
    }

    const findOrCreateUserOAuth2 = async (userProfile) => {

        if (!userProfile.email) {
            throw "required \"email\" field is missing"
        }

        let user = await this.database.getUserByProviderId(userProfile.id)
        if (!user) {
            let registeredUser = await this.database.getUserByEmail(userProfile.email)
            if (!registeredUser) {
                let newUser = {
                    fullname: userProfile.name,
                    email: userProfile.email,
                }  
                this.logger.info("Creating new user...")
                
                registeredUser = await this.database.createUser(newUser);
            }

            let { providers = [] } = registeredUser
            let oauth2ProviderInformation = providers.find(provider => provider.providerUserId == registeredUser.id && provider.providerName == userProfile.provider)
            if (!oauth2ProviderInformation) {
                let oauth2UserInformation = {
                    userId: registeredUser.id,
                    loginName: userProfile.login || "",
                    providerUserId: userProfile.id,
                    providerName: userProfile.provider,
                    picture: userProfile.picture || ""
                }
                this.logger.info(`Register user with id "${registeredUser.id}" from ${userProfile.provider} OAuth 2.0`)
                oauth2ProviderInformation = await this.database.addProviderUser(oauth2UserInformation)
            }
            user = oauth2ProviderInformation
        }

        return user
    }

    
    const mailer = (email,link) => {
        
        var transporter = nodemailer.createTransport({
            service: 'gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: 'nuorder2023@gmail.com',
                pass: 'yqhzpfphhtqanvjt'
            }
        });
        
        var mailOptions = {
            from: 'nuorder2023@gmail.com',
            to: `${email}`,
            subject: 'Reset password LINK',
            text: 'Reset your password : ' + `${link}`
        };

        transporter.sendMail(mailOptions, function(err,info){
            if(err){
                console.log(err);

            }
            else{
                console.log('Email sent'+ info.response);
            };
        });
    };
    //#endregion

    

}
const logger = require("../services/log")
const database = require("../services/database")
const { response } = require("express")
const User = require("../models/user")
const authController = new AuthController(database, logger)

module.exports = authController