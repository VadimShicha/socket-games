import React, { useState } from 'react';
import {sendPOST} from '../../tools';
import NavBar from '../../components/NavBar';
import AuthUser from '../../components/AuthUser';
import { Navigate } from 'react-router';
import DataManager from '../../dataManager';
import Cookies from 'js-cookie';

function SettingsPage()
{
    const [shouldRedirect, setShouldRedirect] = useState(false);

    const [reloader, setReloader] = useState(false);
    
    function logout()
    {
        sendPOST({requestID: "logout"}, function(data)
        {
            console.log(data);
            console.log("Logged out and deleted token");
            Cookies.remove("logged_in");
            DataManager.token = "";
            setShouldRedirect(true);
        });
    }

    return (
        <>
            <NavBar page={3}></NavBar>
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