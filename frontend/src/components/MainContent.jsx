import React, { useEffect, useState, createRef } from 'react';
import { redirect } from 'react-router-dom';
import SentGameInviteForm from "./forms/SentGameInviteForm";
import Cookies from 'js-cookie';
import {socket} from '../socket';

function MainContent()
{
    let gameInvites = [];
    const sentGameInviteRef = createRef();

    let ranStart = false;

    useEffect(() =>
    {
        if(ranStart)
            return;

        socket.on("game_invite_sent", function(data)
        {
            console.log(data);
            gameInvites.push([data.gameName, data.fromUser]);
            sentGameInviteRef.current.show(data.gameName, data.fromUser);
        });

        ranStart = true;
    }, []);

    function removeGameInvite(gameName, username)
    {
        for(let i = 0; i < gameInvites.length; i++)
            if(gameInvites[i][0] == gameName && gameInvites[i][1] == username)
            {
                gameInvites.splice(i, 1);
                break;
            }
    }

    function acceptGameInvite(gameName, username)
    {
        removeGameInvite(gameName, username);

        socket.emit("accept_game_invite", {gameName: gameName, fromUser: username, token: Cookies.get("token")});
        return redirect("/login");
    }

    function declineGameInvite(gameName, username)
    {
        removeGameInvite(gameName, username);

        socket.emit("decline_game_invite", {gameName: gameName, fromUser: username, token: Cookies.get("token")});
    }

    return (
        <>
            <SentGameInviteForm ref={sentGameInviteRef} accept={acceptGameInvite} decline={declineGameInvite}></SentGameInviteForm>
        </>
    );
}

export default MainContent;