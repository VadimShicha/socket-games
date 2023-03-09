import React, {useState} from 'react';
import GameItem from '../../components/GameItem';
import {sendPOST} from '../../tools'
import InviteGameForm from '../../components/forms/InviteGameForm';
import Cookies from 'js-cookie';

function GameListPage()
{
    const [inviteGameHidden, setInviteGameHidden] = useState(true);
    const [hasFriends, setHasFriends] = useState(false);

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

    return (
        <>
            <div className="nav_bar_body">
                <h2>Select a 2-Player Game to Play!</h2>
                <p hidden={hasFriends}>Add a friend to start playing</p>

                <InviteGameForm hidden={inviteGameHidden} close={() => setInviteGameHidden(true)} active={!inviteGameHidden}></InviteGameForm>
                
                <div className="game_items">
                    <GameItem playHidden={!hasFriends} multi={true} info={"First 2-player game"} play={play} imgURL="./first_multi_game.png" name="First"></GameItem>
                </div>
            </div>
        </>
    )
}

export default GameListPage;