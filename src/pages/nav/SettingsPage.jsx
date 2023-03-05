import React, {useState} from 'react';
import {sendPOST} from '../../tools';
import Cookies from 'js-cookie';

function SettingsPage()
{
    function logout()
    {
        sendPOST({requestID: "logout", token: Cookies.get("token")}, function(data)
        {
            console.log("Logged out and deleted token");
            Cookies.remove("token");
            window.location.href = "/login";
        });
    }

    return (
        <>
            <div className="nav_bar_body">
                <h2>Settings</h2>
                <p>Config stuff!</p>
                <button onClick={logout}>Log Out and Delete Token</button>
            </div>
        </>
    )
}

export default SettingsPage;