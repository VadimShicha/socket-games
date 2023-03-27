import React, {useState} from 'react';
import {sendPOST} from '../tools'
import Cookies from 'js-cookie';
import "./SignPage.css";
import { Link, Navigate } from 'react-router-dom';

function LoginPage()
{
    const [shouldRedirect, setShouldRedirect] = useState(false);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [message, setMessage] = useState("");

    function login()
    {
        sendPOST({requestID: "login", username: username, password: password}, function(data)
        {
            setMessage(data.message);

            if(data.success)
            {
                Cookies.set("token", data.token, {expires: 1});
                setShouldRedirect(true);
            }
        });
    }

    function loginExample(user)
    {
        sendPOST({requestID: "login", username: user, password: "bobissad"}, function(data)
        {
            setMessage(data.message);

            if(data.success)
            {
                Cookies.set("token", data.token, {expires: 1});
                setShouldRedirect(true);
            }
        });
    }

    // if(Cookies.get("username") == "null" || Cookies.get("username") == undefined)
    // {
    //     let v = prompt("Name");
    //     Cookies.set("username", v, {expires: 1});
    // }
    // else
    //     alert(Cookies.get("username"));
    

    return (
        <>
            {shouldRedirect && <Navigate to="/"></Navigate>}
            <h2>Login into an Account</h2>
            
            <form onSubmit={(e) => {e.preventDefault()}} className="center_align sign_form">
                <h3 className="sign_form_title">Login</h3>
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

            {/*CODE FOR TEST PURPOSE*/}
            <div style={{position: "absolute", left: "0px", top: "0px"}}>
                <h3>Preset Accounts:</h3>
                <button onClick={() => loginExample("bob")}>Login Bob Example</button><br></br>
                <button onClick={() => loginExample("sally")}>Login Sally Example</button>
            </div>
        </>
    )
}

export default LoginPage;