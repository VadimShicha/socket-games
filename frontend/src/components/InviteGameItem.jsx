import React from 'react';
import "./InviteGameItem.css";

function InviteGameItem(props)
{
    return (
        <tr className="friends_tr">
            <td className="friends_td friends_table_text"><b>{props.username} invited you to play {props.gameName}</b></td>
            <td className="friends_td"><button onClick={() => props.accept(props.gameName, props.username)} className="action_button accept_button"></button></td>
            <td className="friends_td"><button onClick={() => props.decline(props.gameName, props.username)} className="action_button decline_button"></button></td>
        </tr>
    );
}

export default InviteGameItem;