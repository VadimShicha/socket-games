import React, {useState} from 'react';
import GameItem from '../../components/GameItem';
import {sendPOST} from '../../tools'
import InviteGameForm from '../../components/forms/InviteGameForm';
import Cookies from 'js-cookie';
import NavBar from '../../components/NavBar';

function GameListPage()
{
    const [inviteGameHidden, setInviteGameHidden] = useState(true);
    const [hasFriends, setHasFriends] = useState(false);

    const [inviteGameMessage, setInviteGameMessage] = useState("");

    function play(name)
    {
        sendPOST({requestID: "get_friends", token: Cookies.get("token")}, function(data)
        {
            if(data.success)
            {
                if(data.result.length > 0)
                {
                    setInviteGameHidden(false);
                }
            }
        });
    }

    sendPOST({requestID: "get_friends", token: Cookies.get("token")}, function(data)
    {
        if(data.success)
        {
            if(data.result.length > 0)
            {
                setHasFriends(true);
            }
        }
    });

    function send(username)
    {
        console.log(username);
        sendPOST({requestID: "send_game_invite", username: username, token: Cookies.get("token")}, function(data)
        {
            console.log(data);
            setInviteGameMessage(data.message);

            if(data.success)
            {
                
            }
        });
    }

    return (
        <>
            <NavBar page={1}></NavBar>
            <div className="nav_bar_body">
                <h2>Select a 2-Player Game to Play!</h2>
                <p hidden={hasFriends}>Add a friend to start playing</p>

                <InviteGameForm hidden={inviteGameHidden} send={send} close={() => setInviteGameHidden(true)} message={inviteGameMessage} active={!inviteGameHidden}></InviteGameForm>
                
                <div className="game_items">
                    <GameItem playHidden={!hasFriends} multi={true} info={"First 2-player game"} play={play} imgURL="./first_multi_game.png" name="First"></GameItem>
                </div>
            </div>
        </>
    )
}

export default GameListPage;