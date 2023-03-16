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
        sendPOST({requestID: "sign_up", firstName: firstName, lastName: lastName, username: username, password: password, confirmPassword: confirmPassword}, function(data)
        {
            setMessage(data.message);

            if(data.success)
            {
                Cookies.set("token", data.token, {expires: 1});
                window.location.href = "/";
            }
        });
    }

    function createExample(user)
    {
        if(user == "both")
        {
            sendPOST({requestID: "sign_up", firstName: "bob", lastName: "Smith", username: "bob", password: "bobissad", confirmPassword: "bobissad"}, function(data)
            {
                setMessage(data.message);
            });

            sendPOST({requestID: "sign_up", firstName: "sally", lastName: "Smith", username: "sally", password: "bobissad", confirmPassword: "bobissad"}, function(data)
            {
                setMessage(data.message);
            });
            return;
        }
        sendPOST({requestID: "sign_up", firstName: user, lastName: "Smith", username: user, password: "bobissad", confirmPassword: "bobissad"}, function(data)
        {
            setMessage(data.message);

            if(data.success)
            {
                Cookies.set("token", data.token, {expires: 1});
                window.location.href = "/";
            }
        });
    }

    return (
        <>
            <h2>Create an Account</h2>
            <p>Create a new account or <a href="/login">login</a></p>

            <label htmlFor="first_name">First Name:</label><br></br>
            <input onChange={e => setFirstName(e.target.value)} placeholder="First Name" id="first_name"></input><br></br>
            <label htmlFor="last_name">Last Name:</label><br></br>
            <input onChange={e => setLastName(e.target.value)} placeholder="Last Name" id="last_name"></input><br></br>
            <label htmlFor="username">Username:</label><br></br>
            <input onChange={e => {e.target.value = e.target.value.toLowerCase(); setUsername(e.target.value)}} placeholder="Username" id="username"></input><br></br>
            <label htmlFor="password">Password:</label><br></br>
            <input onChange={e => setPassword(e.target.value)} placeholder="Password" id="password"></input><br></br>
            <label htmlFor="confirm_password">Confirm Password:</label><br></br>
            <input onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm Password" id="confirm_password"></input><br></br>
            <br></br>

            <button onClick={signUp}>Create Account</button>
            <p>{message}</p>

            {/*CODE FOR TEST PURPOSE*/}
            <div style={{position: "absolute", left: "0px", top: "0px"}}>
                <h3>Preset Accounts:</h3>
                <button onClick={() => createExample("bob")}>Create Bob Example</button><br></br><br></br>
                <button onClick={() => createExample("sally")}>Create Sally Example</button><br></br><br></br>
                <button onClick={() => createExample("both")}>Create Both Examples</button>
            </div>
        </>
    )
}

export default SignUpPage;