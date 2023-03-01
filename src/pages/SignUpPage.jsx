import React, {useState} from 'react';
import Cookies from 'js-cookie';
import {sendPOST} from '../tools'

function SignUpPage()
{
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [message, setMessage] = useState("");

    function signUp()
    {
        sendPOST({requestID: "create_user", firstName: firstName, lastName: lastName, username: username, password: password, confirmPassword: confirmPassword}, function(data)
        {
            setMessage(data.message);

            if(data.success)
            {
                Cookies.set("token", data.token, {expires: 1});
                window.location.hash = "#";
            }
        });
    }

    return (
        <>
            <h2>Create an Account</h2>
            <p>Create a new account or <a href="#login">login</a></p>
            <input onChange={e => setFirstName(e.target.value)} placeholder="First Name"></input><br></br><br></br>
            <input onChange={e => setLastName(e.target.value)} placeholder="Last Name"></input><br></br><br></br>
            <input onChange={e => {e.target.value = e.target.value.toLowerCase(); setUsername(e.target.value)}} placeholder="Username"></input><br></br><br></br>
            <input onChange={e => setPassword(e.target.value)} placeholder="Password"></input><br></br><br></br>
            <input onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm Password"></input><br></br><br></br>
            <button onClick={signUp}>Create Account</button>
            <p>{message}</p>
        </>
    )
}

export default SignUpPage;