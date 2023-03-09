import React, {useEffect, useState} from 'react';
import {sendPOST} from '../../tools';
import Cookies from 'js-cookie';
import FriendRequest from '../../components/FriendRequest';
import FriendItem from '../../components/FriendItem';
import SendFriendRequestForm from '../../components/forms/SendFriendRequestForm';

function SocialPage(props)
{
    const [sendRequestHidden, setSendRequestHidden] = useState(true);
    // const [searchUsername, setSearchUsername] = useState("");
    const [sendRequestMessage, setSendRequestMessage] = useState("");

    const [requests, setRequests] = useState(<></>);
    const [friends, setFriends] = useState(<></>);

    const [requestsTableRows, setRequestsTableRows] = useState(0);
    const [friendTableRows, setFriendTableRows] = useState(0);

    useEffect(() =>
    {
        //console.log("LOAD SOCIAL");
        refresh();
    }, [props.load]);

    function searchFriend(name)
    {
        sendPOST({requestID: "send_friend_request", username: name, token: Cookies.get("token")}, function(data)
        {
            setSendRequestMessage(data.message);
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

    return (
        <>
            <div className="nav_bar_body">
                <h2>Social</h2>
                <div className="center_align" style={{border: "0px solid black", width: "fit-content"}}>
                    <button className="social_action_element action_button refresh_button" onClick={refresh}></button>
                    <button className="social_action_element action_button invite_button" onClick={() => {setSendRequestHidden(false)}}></button> 
                </div>

                <SendFriendRequestForm hidden={sendRequestHidden} search={searchFriend} message={sendRequestMessage} close={() => {setSendRequestMessage(""); setSendRequestHidden(true)}}></SendFriendRequestForm>
                
                <br></br><br></br>
                <div hidden={friendTableRows == 9}>
                    <div className="friends_div_template" style={{height: "305px"}}>
                        <h3 style={{margin: "0px"}}>Friends:</h3>
                        <table className="friends_table_template" style={{width: "500px"}}>
                            <tbody>
                                {friends}
                            </tbody>
                        </table>
                        <h3 style={{margin: "0px"}}>Requests:</h3>
                        
                        <table className="friends_table_template" style={{width: "500px"}}>
                            <tbody>
                                {requests}
                            </tbody>
                        </table>
                    </div>
                </div>
                <br></br>
                
            </div>
        </>
    )
}

export default SocialPage;