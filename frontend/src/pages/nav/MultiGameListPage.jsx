import React, {useState, createRef, useEffect} from 'react';
import GameItem from '../../components/GameItem';
import {sendPOST} from '../../tools'
import InviteGameForm from '../../components/forms/InviteGameForm';
import Cookies from 'js-cookie';
import NavBar from '../../components/NavBar';
import AuthUser from '../../components/AuthUser';
import DataManager from '../../dataManager';
import { socket } from '../../socket';
import { Navigate } from 'react-router';

function GameListPage()
{
    const [inviteGameHidden, setInviteGameHidden] = useState(true);
    const [inviteGameWaiting, setInviteGameWaiting] = useState(false);
    const [hasFriends, setHasFriends] = useState(false);
    const [gameName, setGameName] = useState("");

    const [inviteGameMessage, setInviteGameMessage] = useState("");

    const [renderComponent, setRenderComponent] = useState(<></>);

    let ranStart = false;

    function play(name)
    {
        sendPOST({requestID: "get_friends", token: Cookies.get("token")}, function(data)
        {
            if(data.success)
            {
                if(data.result.length > 0)
                {
                    setInviteGameHidden(false);
                    setGameName(name);
                }
            }
        });
    }

    function send(username)
    {
        console.log(username);
        socket.emit("send_game_invite", {gameName: gameName, toUser: username, token: Cookies.get("token")}, function(data)
        {
            //if success
            if(data[1] == 0)
            {
                setInviteGameWaiting(true);
            }

            setInviteGameMessage(data[0]);
            DataManager.popTextRef.current.show(data[0]);
        });
        // sendPOST({requestID: "send_game_invite", username: username, token: Cookies.get("token")}, function(data)
        // {
        //     console.log(data);
        //     setInviteGameMessage(data.message);

        //     if(data.success)
        //     {
        //         
        //     }
        // });
    }

    useEffect(() =>
    {
        if(ranStart)
            return;

        sendPOST({requestID: "get_friends", token: Cookies.get("token")}, function(data)
        {
            console.log(data.result.length);
            if(data.success)
            {
                if(data.result.length > 0)
                {
                    setHasFriends(true);
                }
            }
        });

        socket.on("game_invite_declined", function(data)
        {
            setInviteGameWaiting(false);
            DataManager.popTextRef.current.show(data.toUser + " declined game invite");
            console.log("DECLINE");
            console.log(data);
        });

        socket.on("send_to_game", function(data)
        {
            console.log(data);
            setRenderComponent(<Navigate to={"/multiplayer/game-" + data.gameName.toLowerCase()}></Navigate>);
        });

        ranStart = true;
    }, []);

    return (
        <>
            <AuthUser></AuthUser>
            <NavBar page={1}></NavBar>
            {renderComponent}
            <div className="nav_bar_body">
                <h2>Select a 2-Player Game to Play!</h2>
                <p hidden={hasFriends}>Add a friend to start playing</p>

                <InviteGameForm hidden={inviteGameHidden} waiting={inviteGameWaiting} send={send} close={() => setInviteGameHidden(true)} message={inviteGameMessage} active={!inviteGameHidden}></InviteGameForm>
                
                <div className="game_items">
                    <GameItem playHidden={!hasFriends} multi={true} info={"First 2-player game"} play={play} imgURL="../assets/first_multi_game.png" name="First"></GameItem>
                </div>
            </div>
        </>
    );
}

export default GameListPage;