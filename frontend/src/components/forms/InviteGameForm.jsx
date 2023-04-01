import React, {useEffect, useState} from 'react';
import {sendPOST} from '../../tools';
import InviteFriendItem from '../InviteFriendItem';
import "../../styles/InviteGameForm.css";
import "../../styles/FormTemplate.css";

function InviteGameForm(props)
{
    const [friends, setFriends] = useState(<></>);
    const [friendTableRows, setFriendTableRows] = useState(0);

    useEffect(() =>
    {
        getFriends();
    }, []);

    //props.active

    function send(username, index)
    {
        console.log(index);
        props.send(username);
    }

    function getFriends()
    {
        sendPOST({requestID: "get_friends"}, function(data)
        {
            if(data.success)
            {
                setFriendTableRows(data.result.length);
                let element = data.result.map((item, index) =>
                    <InviteFriendItem key={item} username={item} send={(username) => send(username, index)}></InviteFriendItem>);
                setFriends(element);
            }
        });
    }
    
    return (
        <div hidden={props.hidden}>
            <div hidden={props.waiting} className="form_template invite_game_div center_align">
                <h3>Invite a Friend to Join You!</h3>
                <button onClick={props.close} className="form_template_close_button action_button decline_button"></button>
                <div hidden={friendTableRows == 0}>
                    <div className="invite_game_friends_div">
                        <table className="invite_game_friends_table">
                            <tbody>{friends}</tbody>
                        </table>
                    </div>
                </div>
                {/* <p>{props.message}</p> */}
            </div>
            <div hidden={!props.waiting} className="form_template invite_game_div center_align">
            <h3>Sent game invite bobthebob</h3>
                <p>Waiting for user to accept game invite</p>
                <button onClick={props.cancelRequest}>Cancel Request</button>
            </div>
        </div>
        
    );
}

export default InviteGameForm;