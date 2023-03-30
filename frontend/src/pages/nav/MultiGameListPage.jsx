import React, {useState, useEffect} from 'react';
import GameItem from '../../components/GameItem';
import {sendPOST} from '../../tools'
import InviteGameForm from '../../components/forms/InviteGameForm';
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
    function play(gameUrl)
    {
        //checks if the user has any friends
        if(hasFriends)
        {
            setInviteGameHidden(false); //shows the game invite form
            setGameUrl(gameUrl); //stores the url that was of the game that was clicked
        }
    }

    function send(username)
    {
        socket.emit("send_game_invite", {gameUrl: gameUrl, toUser: username, token: DataManager.token}, function(data)
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

        sendPOST({requestID: "get_friends", token: DataManager.token}, function(data)
        {
            if(data.success && data.result.length <= 0)
                setHasFriends(false);
        });

        //called when the user who the game invite was sent to declined it
        socket.on("game_invite_declined", function(data)
        {
            setInviteGameWaiting(false);
            DataManager.popTextRef.current.show(data.toUser + " declined game invite");
        });

        //called when the user who the game invite was sent to accepted it
        socket.on("send_to_game", function(data)
        {
            setRenderComponent(<Navigate to={"/multiplayer/game-" + data.gameUrl}></Navigate>); //navigate the user to the game page
        });

        ranStart = true;
    }, []);

    //called when the user that sent the game invite canceled it
    function cancelGameInvite()
    {
        socket.emit("cancel_game_invite", {gameUrl: gameUrl, username: waitingUsername, token: DataManager.token}, function(data)
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
                    <GameItem playHidden={!hasFriends} multi={true} info={"Tic Tac Toe\n\nPlayed on a board that looks like this:\n\n   |   |   \n---+---+---\n   |   |   \n---+---+---\n   |   |   \n\nYou and your opponent take turns placing X's and O's. First to get a 3 in a row wins! If neither get a 3 in a row the game ends in a draw.\n\n\nMade on 3/26/2023"} play={play} imgURL="../assets/tic_tac_toe.svg" gameUrl="tic_tac_toe" title="Tic Tac Toe"></GameItem>
                </div>
            </div>
        </>
    );
}

export default GameListPage;