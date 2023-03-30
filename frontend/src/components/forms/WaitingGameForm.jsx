import React, {useEffect, useState} from 'react';
import {sendPOST} from '../../tools';
import Cookies from 'js-cookie';
import InviteFriendItem from '../InviteFriendItem';
import "../../styles/FormTemplate.css";

function WaitingGameForm(props)
{
    const [friends, setFriends] = useState(<></>);
    const [friendTableRows, setFriendTableRows] = useState(0);

    useEffect(() =>
    {
        getFriends();
    }, [props.active]);

    function send(username, index)
    {
        console.log(index);
        props.send(username);
    }

    function getFriends()
    {
        sendPOST({requestID: "get_friends", token: Cookies.get("token")}, function(data)
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
        <div hidden={props.hidden} className="form_template invite_game_div center_align" style={{width: "400px", height: "260px"}}>
            <h3>Waiting for {props.name}</h3>
            <button onClick={props.close} className="invite_game_div_close action_button decline_button"></button>
            <div hidden={friendTableRows == 0}>
                <div className="friends_div_template" style={{height: "150px"}}>
                    <table className="friends_table_template" style={{width: "200px"}}>
                        <tbody>{friends}</tbody>
                    </table>
                </div>
            </div>
            <p>{props.message}</p>
        </div>
    );
}

export default WaitingGameForm;