import React, {useState} from 'react';
import {sendPOST} from '../tools'

function FriendItem(props)
{
    return (
        <tr className="friends_tr" style={{textAlign: "center"}}>
            <td className="friends_td friends_table_text"><b>{props.username}</b></td>
            <td className="friends_td"><button className="action_button message_button"></button></td>
            <td className="friends_td"><button className="action_button decline_button"></button></td>
        </tr>
    );
}

export default FriendItem;