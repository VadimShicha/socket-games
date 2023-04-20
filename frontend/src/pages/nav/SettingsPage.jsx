import React, { useState } from 'react';
import {sendPOST} from '../../tools';
import NavBar from '../../components/NavBar';
import AuthUser from '../../components/AuthUser';
import { Navigate } from 'react-router';
import DataManager from '../../dataManager';
import Cookies from 'js-cookie';
import { socket } from '../../socket';
import ToggleSwitch from '../../components/ToggleSwitch';
import "../../styles/SettingsPage.css";

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
            socket.disconnect();
            socket.connect();
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
                
                <table className="settings_table center_align">
                    <tbody>
                        <tr>
                            <td>
                                <p title="Play with guests when you play a random-player game">Play with guests</p>
                            </td>
                            <td>
                                <ToggleSwitch defaultChecked onChange={(data) => console.log(data)}></ToggleSwitch>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <p>Some other option</p>
                            </td>
                            <td>
                                <ToggleSwitch onChange={(data) => console.log(data)}></ToggleSwitch>
                            </td>
                        </tr>
                    </tbody>
                </table>
                
                <button title="Logout and delete session" onClick={logout}>Log Out</button>
            </div>
        </>
    )
}

export default SettingsPage;