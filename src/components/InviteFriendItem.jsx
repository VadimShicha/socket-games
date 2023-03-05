import React, {useState} from 'react';
import {sendPOST} from '../tools'

function InviteFriendItem(props)
{
    return (
        <tr style={{textAlign: "center"}}>
            <td style={{display: "inline", width: "415px"}}><b>{props.username}</b></td>
            <td style={{margin: "0px"}}><button className="action_buttons invite_button"></button></td>
        </tr>
    );
}

export default InviteFriendItem;