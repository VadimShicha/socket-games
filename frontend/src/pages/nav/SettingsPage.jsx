import React, { useState } from 'react';
import {sendPOST} from '../../tools';
import NavBar from '../../components/NavBar';
import AuthUser from '../../components/AuthUser';
import { Navigate } from 'react-router';
import DataManager from '../../dataManager';

function SettingsPage()
{
    const [shouldRedirect, setShouldRedirect] = useState(false);
    
    function logout()
    {
        sendPOST({requestID: "logout"}, function(data)
        {
            console.log("Logged out and deleted token");
            DataManager.token = "";
            DataManager.authed = false;
            setShouldRedirect(true);
        });
    }

    return (
        <>
            <NavBar page={3}></NavBar>
            <AuthUser></AuthUser>
            {shouldRedirect && <Navigate to="/"></Navigate>}
            <div className="nav_bar_body">
                <h2>Settings</h2>
                <p>Config stuff!</p>
                <button title="Logout and delete session" onClick={logout}>Log Out</button>
            </div>
        </>
    )
}

export default SettingsPage;