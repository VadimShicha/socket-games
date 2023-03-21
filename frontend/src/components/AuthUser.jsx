import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendPOST } from '../tools';
import Cookies from 'js-cookie';
import {socket} from '../socket';

function AuthUser()
{
    const navigate = useNavigate();
    const [success, setSuccess] = useState(null);

    if(window.location.pathname == "/" || window.location.pathname == "/multiplayer" || window.location.pathname == "/social" || window.location.pathname == "/settings")
    {
        //check if the login token is valid
        sendPOST({requestID: "auth_token", token: Cookies.get("token")}, function(data)
        {
            //if the auth failed redirect to login page
            setSuccess(data.success);
        });
    }

    useEffect(() =>
    {
        if(success == false)
            navigate("/login");
        else
        {
            socket.emit("set_username", {token: Cookies.get("token")});
        }
    }, [success]);

    return (
        <></>
    );
}

export default AuthUser;