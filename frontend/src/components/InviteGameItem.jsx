import React from 'react';
import "./InviteGameItem.css";

function InviteGameItem(props)
{
    return (
        <tr className="friends_tr">
            <td className="friends_td friends_table_text"><b>{props.username}</b></td>
            <td className="friends_td"><button className="action_button accept_button"></button></td>
            <td className="friends_td"><button className="action_button decline_button"></button></td>
        </tr>
    );
}

export default InviteGameItem;