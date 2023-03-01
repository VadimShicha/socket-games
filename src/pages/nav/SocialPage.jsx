import React, {useEffect, useState} from 'react';
import {sendPOST} from '../../tools';
import Cookies from 'js-cookie';
import FriendRequest from '../../components/FriendRequest';
import FriendItem from '../../components/FriendItem';

function SocialPage()
{
    const [searchUsername, setSearchUsername] = useState("");
    const [sendRequestMessage, setSendRequestMessage] = useState("");

    const [requests, setRequests] = useState(<></>);
    const [friends, setFriends] = useState(<></>);

    const [requestsTableRows, setRequestsTableRows] = useState(0);
    const [friendTableRows, setFriendTableRows] = useState(0);

    function searchFriend()
    {
        sendPOST({requestID: "send_friend_request", username: searchUsername, token: Cookies.get("token")}, function(data)
        {
            setSendRequestMessage(data.message);
            console.log(data);
        });
    }

    function acceptFriendRequest(username)
    {
        console.log("sdg");
        sendPOST({requestID: "accept_friend_request", username: username, token: Cookies.get("token")}, function(data)
        {
            console.log(data);
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
            console.log(data);
            if(data.success)
            {
                setFriendTableRows(data.result.length);
                let element = data.result.map((item) =>
                    <FriendItem key={item} username={item}></FriendItem>);
                setFriends(element);
            }
        });
    }

    function refresh()
    {
        getRequests();
        getFriends();
    }

    useEffect(() =>
    {
        console.log("LATE");
    }, []);

    return (
        <>
            <div className="nav_bar_body">
                <h2>Social</h2>
                <button onClick={refresh}>Refresh</button>
                <br></br><br></br>
                <div hidden={friendTableRows == 0}>
                    <h4>Friends</h4>
                    <div className="friends_div">
                        <table className="friends_table">
                            <tbody>{friends}</tbody>
                        </table>
                    </div>
                </div>
                <div hidden={requestsTableRows == 0}>
                    <h4>Friend Requests:</h4>
                    <div className="friend_request_div">
                        <table className="friend_request_table">
                            <tbody>{requests}</tbody>
                        </table>
                    </div>
                </div>
                <br></br>
                <input onChange={(e) => {e.target.value = e.target.value.toLowerCase(); setSearchUsername(e.target.value)}} placeholder="Search Username"></input>
                <button onClick={searchFriend}>Send Request</button>
                <p>{sendRequestMessage}</p>
            </div>
        </>
    )
}

export default SocialPage;