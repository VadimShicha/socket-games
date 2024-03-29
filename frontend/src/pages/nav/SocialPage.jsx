import React, {useEffect, useState} from 'react';
import {sendPOST} from '../../tools';
import Cookies from 'js-cookie';
import FriendRequest from '../../components/FriendRequest';
import FriendItem from '../../components/FriendItem';
import InviteGameItem from '../../components/InviteGameItem';
import SendFriendRequestForm from '../../components/forms/SendFriendRequestForm';
import NavBar from '../../components/NavBar';
import "../../styles/SocialPage.css";
import AuthUser from '../../components/AuthUser';
import DataManager from '../../dataManager';
import { socket } from '../../socket';

function SocialPage(props)
{
    const [sendRequestHidden, setSendRequestHidden] = useState(true);
    const [sendRequestMessage, setSendRequestMessage] = useState("");

    const [requests, setRequests] = useState(<></>);
    const [friends, setFriends] = useState(<></>);
    const [gameInvites, setGameInvites] = useState([].map(() => <></>));

    const [requestsTableRows, setRequestsTableRows] = useState(0);
    const [friendTableRows, setFriendTableRows] = useState(0);
    const [gameInvitesTableRows, setGameInvitesTableRows] = useState(0);

    let ranStart = false;

    useEffect(() =>
    {
        getGameInvites();
    }, [props.gameInvites]);

    useEffect(() =>
    {
        if(ranStart)
            return;

        refresh();
        ranStart = true;
    }, []);

    function searchFriend(name)
    {
        sendPOST({requestID: "send_friend_request", username: name, token: Cookies.get("token")}, function(data)
        {
            setSendRequestMessage(data.message);
            DataManager.popTextRef.current.show(data.message);
            sendFriendRequestClose();
        });
    }

    function acceptFriendRequest(username)
    {
        sendPOST({requestID: "accept_friend_request", username: username, token: Cookies.get("token")}, function(data)
        {
            if(data.success)
            {
                getRequests();
            }
        });
    }

    function declineFriendRequest(username)
    {
        sendPOST({requestID: "decline_friend_request", username: username, token: Cookies.get("token")}, function(data)
        {
            if(data.success)
            {
                getRequests();
            }
        });
    }

    function removeGameInvite(fromUser)
    {
        let element = gameInvites;

        for(let i = 0; i < element.length; i++)
            if(element[i].props.username == fromUser)
                element.splice(i, 1);

        
        setGameInvites(element);
        setGameInvitesTableRows(gameInvitesTableRows - 1);
    }

    function acceptGameInvite(gameUrl, username)
    {
        props.removeGameInvite(gameUrl, username);
        socket.emit("accept_game_invite", {gameUrl: gameUrl, fromUser: username, token: DataManager.token});

        removeGameInvite(username);
    }

    function declineGameInvite(gameUrl, username)
    {
        props.removeGameInvite(gameUrl, username);
        socket.emit("decline_game_invite", {gameUrl: gameUrl, fromUser: username, token: DataManager.token});

        removeGameInvite(username);
    }

    function getRequests()
    {
        sendPOST({requestID: "get_friend_requests", token: Cookies.get("token")}, function(data)
        {
            if(data.success)
            {
                setRequestsTableRows(data.result.length);
                let element = data.result.map((item) =>
                    <FriendRequest key={item} accept={acceptFriendRequest} decline={declineFriendRequest} username={item}></FriendRequest>);
                setRequests(element);
            }
        });
    }

    function getFriends()
    {
        console.log(DataManager.token);
        sendPOST({requestID: "get_friends"}, function(data)
        {
            if(data.success)
            {
                setFriendTableRows(data.result.length);
                let element = data.result.map((item) =>
                    <FriendItem key={item} username={item}></FriendItem>);
                setFriends(element);
            }
        });
    }

    function getGameInvites()
    {
        setGameInvitesTableRows(props.gameInvites.length);
        let element = props.gameInvites.map((item) =>
            <InviteGameItem key={item[1]} accept={() => acceptGameInvite(item[0], item[1])} decline={() => declineGameInvite(item[0], item[1])} title={DataManager.gameUrlToTitle(item[0])} gameUrl={item[0]} username={item[1]}></InviteGameItem>);

        setGameInvites(element);
    }

    function refresh()
    {
        getGameInvites();
        getRequests();
        getFriends();
    }

    function refreshClicked()
    {
        refresh();
        DataManager.popTextRef.current.show("Refreshed");
    }

    function sendFriendRequestClose()
    {
        setSendRequestMessage(""); 
        setSendRequestHidden(true);
    }

    return (
        <div>
            <NavBar page={2}></NavBar>
            <div className="nav_bar_body">
                <h2>Social</h2>
                <div className="center_align social_action_div">
                    <button title="Refresh" className="social_action_element action_button refresh_button" onClick={refreshClicked}></button>
                    <button title="Add user" className="social_action_element action_button invite_button" onClick={() => {setSendRequestHidden(false)}}></button> 
                </div>

                <SendFriendRequestForm hidden={sendRequestHidden} search={searchFriend} message={sendRequestMessage} close={sendFriendRequestClose}></SendFriendRequestForm>
                
                <br></br><br></br>
                <div hidden={friendTableRows == 9}>
                    <div hidden={gameInvitesTableRows == 0 && friendTableRows == 0 && requestsTableRows == 0} className="friends_div_template">
                        <div hidden={gameInvitesTableRows <= 0}>
                            <h3 className="friends_table_title">Game Invites</h3>
                            <table className="friends_table_template">
                                <tbody>
                                    {gameInvites}
                                </tbody>
                            </table>
                        </div>
                        <div hidden={friendTableRows == 0}>
                            <h3 className="friends_table_title">Friends:</h3>
                            <table className="friends_table_template">
                                <tbody>
                                    {friends}
                                </tbody>
                            </table>
                        </div>
                        <div hidden={requestsTableRows == 0}>
                            <h3 className="friends_table_title">Requests:</h3>
                            <table className="friends_table_template">
                                <tbody>
                                    {requests}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <br></br>
            </div>
        </div>
    )
}

export default SocialPage;