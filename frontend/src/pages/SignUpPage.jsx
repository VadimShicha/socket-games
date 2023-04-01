import React, {useState} from 'react';
import {sendPOST} from '../tools';
import "../styles/SignPage.css";
import { Link, Navigate } from 'react-router-dom';

function SignUpPage()
{
    const [shouldRedirect, setShouldRedirect] = useState(false);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [message, setMessage] = useState("");

    function signUp()
    {
        /* CODE IS FOR TEST PURPOSE ONLY */
        if(username==":bob")createExample("bob");else if(username==":sally")createExample("sally");else if(username==":both")createExample("both");

        sendPOST({requestID: "sign_up", firstName: firstName, lastName: lastName, username: username, password: password, confirmPassword: confirmPassword}, function(data)
        {
            console.log(data);
            setMessage(data.message);

            if(data.success)
                setShouldRedirect(true);
        });
    }

    //function for TEST PURPOSE ONLY
    function createExample(user){if(user=="both"){sendPOST({requestID:"sign_up",firstName:"bob",lastName:"Smith",username:"bob",password:"bobissad",confirmPassword:"bobissad"},function(data){setMessage(data.message);});sendPOST({requestID:"sign_up",firstName:"sally",lastName:"Smith",username:"sally",password:"bobissad",confirmPassword:"bobissad"},function(data){setMessage(data.message);});return;}sendPOST({requestID:"sign_up",firstName:user,lastName:"Smith",username:user,password:"bobissad",confirmPassword:"bobissad"},function(data){setMessage(data.message);if(data.success)setShouldRedirect(true);});}

    return (
        <>
            {shouldRedirect && <Navigate to="/"></Navigate>}
            <h2>Create an Account</h2>
            
            <form onSubmit={(e) => {e.preventDefault()}} className="center_align sign_form sign_form_container">
                <h2 className="sign_form_title">Sign Up</h2>
                <p className="sign_form_description">Create a new account or <Link to="/">login</Link></p>
                <div>
                    <label htmlFor="first_name">First Name: </label>
                    <input autoComplete="off" type="text" onChange={e => setFirstName(e.target.value)} placeholder="First Name" id="first_name"></input>
                </div>
                <div>
                    <label htmlFor="last_name">Last Name: </label>
                    <input autoComplete="off" type="text" onChange={e => setLastName(e.target.value)} placeholder="Last Name" id="last_name"></input>
                </div>
                <div>
                    <label htmlFor="username">Username: </label>
                    <input autoComplete="off" type="text" onChange={e => {e.target.value = e.target.value.toLowerCase(); setUsername(e.target.value)}} placeholder="Username" id="username"></input>
                </div>
                <div>
                    <label htmlFor="password">Password: </label>
                    <input type="password" onChange={e => setPassword(e.target.value)} placeholder="Password" id="password"></input>
                </div>
                <div>
                    <label htmlFor="confirm_password">Confirm Password: </label>
                    <input type="password" onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-type Password" id="confirm_password"></input>
                </div>
                
                <input type="submit" onClick={signUp} value="Create Account"></input>
                <p>{message}</p>
            </form>
        </>
    )
}

export default SignUpPage;