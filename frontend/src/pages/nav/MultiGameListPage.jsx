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
    const [inviteGameWaiting, setInviteGameWaiting] = useState(false); //indicates whether the user is waiting for another user for a game invite
    const [hasFriends, setHasFriends] = useState(true); //indicates whether the user has friends
    const [gameUrl, setGameUrl] = useState("");
    const [waitingUsername, setWaitingUsername] = useState(""); //the username you are waiting for

    const [inviteGameMessage, setInviteGameMessage] = useState("");

    const [renderComponent, setRenderComponent] = useState(<></>); //the component being rendered

    let ranStart = false;

    //called when the play button on a game is clicked
    function play(name)
    {
        sendPOST({requestID: "get_friends", token: Cookies.get("token")}, function(data)
        {
            if(data.success)
            {
                //checks if the user has any friends
                if(data.result.length > 0)
                {
                    setInviteGameHidden(false); //shows the game invite form
                    setGameUrl(name); //stores the url that was of the game that was clicked
                }
            }
        });
    }

    function send(username)
    {
        console.log(username);
        socket.emit("send_game_invite", {gameUrl: gameUrl, toUser: username, token: Cookies.get("token")}, function(data)
        {
            //if success
            if(data[1] == 0)
            {
                setWaitingUsername(username);
                setInviteGameWaiting(true);
            }

            setInviteGameMessage(data[0]);
            DataManager.popTextRef.current.show(data[0]);
        });
    }

    useEffect(() =>
    {
        if(ranStart)
            return;

        sendPOST({requestID: "get_friends", token: Cookies.get("token")}, function(data)
        {
            if(data.success && data.result.length <= 0)
                setHasFriends(false);
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
            Cookies.set("gameID", data.gameID);
            setRenderComponent(<Navigate to={"/multiplayer/game-" + data.gameUrl}></Navigate>);
        });

        ranStart = true;
    }, []);

    function cancelGameInvite()
    {
        socket.emit("cancel_game_invite", {gameUrl: gameUrl, username: waitingUsername, token: Cookies.get("token")}, function(data)
        {
            if(data[1] == 0)
            {
                setInviteGameHidden(true);
                setInviteGameWaiting(false);
                setWaitingUsername("");
            }
        });
    }

    return (
        <>
            <AuthUser></AuthUser>
            <NavBar page={1}></NavBar>
            {renderComponent}
            <div className="nav_bar_body">
                <h2>Select a 2-Player Game to Play!</h2>
                <p hidden={hasFriends}>Add a friend to start playing</p>

                <InviteGameForm hidden={inviteGameHidden} cancelRequest={cancelGameInvite} waiting={inviteGameWaiting} send={send} close={() => setInviteGameHidden(true)} message={inviteGameMessage} active={!inviteGameHidden}></InviteGameForm>
                
                <div className="game_items">
                    <GameItem playHidden={!hasFriends} multi={true} info={"First 2-player game\n\nThis game is made to test multiplayer."} play={play} imgURL="../assets/first_multi_game.png" gameUrl="first" title="First"></GameItem>
                    <GameItem playHidden={!hasFriends} multi={true} info={"Tic Tac Toe\n\nPlayed on a board that looks like this:\n\n   |   |   \n---+---+---\n   |   |   \n---+---+---\n   |   |   \n\nYou and your opponent take turns placing X's and O's. First to get a 3 in a row wins! If neither get a 3 in a row the game ends in a draw.\n\n\nMade on 3/26/2023"} play={play} imgURL="../assets/example/game_image3.png" gameUrl="tic_tac_toe" title="Tic Tac Toe"></GameItem>
                </div>
            </div>
        </>
    );
}

export default GameListPage;