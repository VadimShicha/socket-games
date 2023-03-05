import React, {useEffect, useState} from 'react';
import {sendPOST} from '../tools';
import FriendItem from './FriendItem';
import Cookies from 'js-cookie';
import InviteFriendItem from './InviteFriendItem';

function InviteGame(props)
{
    const [friends, setFriends] = useState(<></>);
    const [friendTableRows, setFriendTableRows] = useState(0);

    useEffect(() =>
    {
        getFriends();
    }, [props.active]);

    function getFriends()
    {
        sendPOST({requestID: "get_friends", token: Cookies.get("token")}, function(data)
        {
            if(data.success)
            {
                setFriendTableRows(data.result.length);
                let element = data.result.map((item) =>
                    <InviteFriendItem key={item} username={item}></InviteFriendItem>);
                setFriends(element);
            }
        });
    }
    
    return (
        <div className="invite_game_div">
            <h3>Invite a Friend to Join You!</h3>
            <button onClick={props.close} className="invite_game_div_close action_buttons decline_button"></button>
            <div hidden={friendTableRows == 0}>
                <div className="friends_div">
                    <table className="friends_table">
                        <tbody>{friends}</tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default InviteGame;