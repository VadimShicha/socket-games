import React, {useState} from 'react';
import {sendPOST} from '../tools'
import "../styles/SignPage.css";
import { Link, Navigate } from 'react-router-dom';

function LoginPage()
{
    const [shouldRedirect, setShouldRedirect] = useState(false);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [message, setMessage] = useState("");

    function login()
    {
        /* CODE IS FOR TEST PURPOSE ONLY */
        if(username==":bob")loginExample("bob");else if(username==":sally")loginExample("sally");

        sendPOST({requestID: "login", username: username, password: password}, function(data)
        {
            setMessage(data.message);

            if(data.success)
                setShouldRedirect(true);
        });
    }

    //function for TEST PURPOSE ONLY
    function loginExample(user){sendPOST({requestID:"login",username:user,password:"bobissad"},function(data){setMessage(data.message);if(data.success)setShouldRedirect(true);});}

    return (
        <>
            {shouldRedirect && <Navigate to="/"></Navigate>}
            <h2>Login into an Account</h2>
            
            <form onSubmit={(e) => {e.preventDefault()}} className="center_align sign_form">
                <h2 className="sign_form_title">Login</h2>
                <p className="sign_form_description">Login into an existing account or <Link to="/sign_up">sign up</Link></p>
                <div>
                    <label htmlFor="username">Username:</label>
                    <input autoComplete="off" type="text" onChange={e => setUsername(e.target.value)} placeholder="Username" id="username"></input>
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input type="password" onChange={e => setPassword(e.target.value)} placeholder="Password" id="password"></input>
                </div>
                <input type="submit" onClick={login} value="Login"></input>
                <p>{message}</p>
            </form>
        </>
    )
}

export default LoginPage;