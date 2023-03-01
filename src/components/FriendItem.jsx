import React, {useState} from 'react';
import {sendPOST} from '../tools'

function FriendItem(props)
{
    return (
        <tr style={{textAlign: "center"}}>
            <td style={{display: "inline", width: "415px"}}><b>{props.username}</b></td>
        </tr>
    );
}

export default FriendItem;