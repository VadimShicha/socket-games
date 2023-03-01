import React, {useState} from 'react';
import {sendPOST} from '../tools'

function FriendRequest(props)
{
    const accept = () =>
    {
        props.accept(props.username)
    };

    const decline = () =>
    {
        props.decline(props.username)
    };
    return (
        <tr style={{textAlign: "center"}}>
            <td style={{display: "inline", width: "415px"}}><b>{props.username}</b> wants to be your friend</td>
            <td style={{margin: "0px"}}><button onClick={() => accept()} className="action_buttons accept_button"></button></td>
            <td style={{margin: "0px"}}><button onClick={() => decline()} className="action_buttons decline_button"></button></td>
        </tr>
    );
}

export default FriendRequest;