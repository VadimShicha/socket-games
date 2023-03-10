import React, {useState} from 'react';
import {sendPOST} from '../tools'
import Cookies from 'js-cookie';

function LoginPage()
{
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
                window.location.href = "/";
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
                window.location.href = "/";
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
            <h2>Login into an Account</h2>
            <p>Login into an existing account or <a href="/sign_up">sign up</a></p>
            <input onChange={e => setUsername(e.target.value)} placeholder="Username"></input><br></br><br></br>
            <input onChange={e => setPassword(e.target.value)} placeholder="Password"></input><br></br><br></br>
            <button onClick={login}>Login</button>
            <p>{message}</p>

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