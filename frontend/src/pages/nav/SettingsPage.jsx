import React, { useState } from 'react';
import {sendPOST} from '../../tools';
import NavBar from '../../components/NavBar';
import AuthUser from '../../components/AuthUser';
import { Navigate } from 'react-router';

function SettingsPage()
{
    const [shouldRedirect, setShouldRedirect] = useState(false);
    
    function logout()
    {
        sendPOST({requestID: "logout"}, function(data)
        {
            console.log("Logged out and deleted token");
            setShouldRedirect(true);
        });
    }

    return (
        <>
            <AuthUser></AuthUser>
            {shouldRedirect && <Navigate to="/login"></Navigate>}
            <NavBar page={3}></NavBar>
            <div className="nav_bar_body">
                <h2>Settings</h2>
                <p>Config stuff!</p>
                <button title="Logout and delete session" onClick={logout}>Log Out</button>
            </div>
        </>
    )
}

export default SettingsPage;