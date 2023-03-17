import React, {useEffect, useState, createRef} from 'react';
import {sendPOST} from '../../tools';
import Cookies from 'js-cookie';
import FriendRequest from '../../components/FriendRequest';
import FriendItem from '../../components/FriendItem';
import InviteGameItem from '../../components/InviteGameItem';
import SendFriendRequestForm from '../../components/forms/SendFriendRequestForm';
import PopText from '../../components/PopText';
import NavBar from '../../components/NavBar';
import "./SocialPage.css";

function SocialPage(props)
{
    const [sendRequestHidden, setSendRequestHidden] = useState(true);
    const [sendRequestMessage, setSendRequestMessage] = useState("");

    const [requests, setRequests] = useState(<></>);
    const [friends, setFriends] = useState(<></>);
    const [gameInvites, setGameInvites] = useState(<></>);

    const [requestsTableRows, setRequestsTableRows] = useState(0);
    const [friendTableRows, setFriendTableRows] = useState(0);
    const [gameInvitesTableRows, setGameInvitesTableRows] = useState(0);

    const popTextRef = createRef();

    useEffect(() =>
    {
        refresh();
    }, [props.load]);

    function searchFriend(name)
    {
        sendPOST({requestID: "send_friend_request", username: name, token: Cookies.get("token")}, function(data)
        {
            setSendRequestMessage(data.message);
            popTextRef.current.show(data.message);
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
        sendPOST({requestID: "get_friends", token: Cookies.get("token")}, function(data)
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
        sendPOST({requestID: "get_game_invites", token: Cookies.get("token")}, function(data)
        {
            if(data.success)
            {
                setGameInvitesTableRows(data.result.length);
                let element = data.result.map((item) =>
                    <InviteGameItem key={item} username={item}></InviteGameItem>);
                setGameInvites(element);
            }
        });
    }

    function refresh()
    {
        getGameInvites();
        getRequests();
        getFriends();
    }

    function sendFriendRequestClose()
    {
        setSendRequestMessage(""); 
        setSendRequestHidden(true);
    }

    return (
        <>
            <NavBar page={2}></NavBar>
            <PopText ref={popTextRef}></PopText>
            <div className="nav_bar_body">
                <h2>Social</h2>
                <div className="center_align social_action_div">
                    <button title="Refresh" className="social_action_element action_button refresh_button" onClick={refresh}></button>
                    <button title="Add user" className="social_action_element action_button invite_button" onClick={() => {setSendRequestHidden(false)}}></button> 
                </div>

                <SendFriendRequestForm popTextRef={popTextRef} hidden={sendRequestHidden} search={searchFriend} message={sendRequestMessage} close={sendFriendRequestClose}></SendFriendRequestForm>
                
                <br></br><br></br>
                <div hidden={friendTableRows == 9}>
                    <div hidden={gameInvitesTableRows == 0 && friendTableRows == 0 && requestsTableRows == 0} className="friends_div_template">
                        <div hidden={gameInvitesTableRows == 0}>
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
        </>
    )
}

export default SocialPage;