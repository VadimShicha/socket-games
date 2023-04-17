import React, {useState} from 'react';
import {sendPOST} from '../tools'
import "../styles/SignPage.css";
import { Link, Navigate } from 'react-router-dom';
import DataManager from '../dataManager';
import {socket} from '../socket';

function LoginPage(props)
{
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [message, setMessage] = useState(<>&nbsp;</>);

    function login()
    {
        /* CODE IS FOR TEST PURPOSE ONLY */
        if(username==":bob")loginExample("bob");else if(username==":sally")loginExample("sally");

        console.log(username);
        console.log(password);

        //do a check to avoid sending a request to the server incase the user accidentally clicked
        if(username == "" || password == "")
        {
            setMessage("Field(s) not filled out");
            return;
        }

        sendPOST({requestID: "login", username: username, password: password}, function(data)
        {
            console.log(data);
            setMessage(data.message);
        
            //reconnect the socket to rerun the socket init code
            socket.disconnect();
            socket.connect();

            if(data.success)
                props.loginSuccess();
        });
    }

    //function for TEST PURPOSE ONLY
    function loginExample(user){sendPOST({requestID:"login",username:user,password:"bobissad"},function(data){setMessage(data.message);if(data.success)props.loginSuccess();});}

    return (
        <>
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
                <p className="sign_form_message">{message}</p>
                <input type="submit" onClick={login} value="Login"></input>
            </form>
        </>
    )
}

export default LoginPage;