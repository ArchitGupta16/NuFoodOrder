import React from 'react'

const Button = ({ route, buttonText }) => {
    return (
        <button className="link-button" onClick={() => { window.location.href = route }}>
            {buttonText}
        </button>
    )
}

export default Button