import React, {useState} from 'react';
import {sendPOST} from '../../tools';
import Cookies from 'js-cookie';
import NavBar from '../../components/NavBar';

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