import React from 'react';
import "./InviteGameItem.css";
import { Link } from 'react-router-dom';

function InviteGameItem(props)
{
    return (
        <tr className="friends_tr">
            <td className="friends_td friends_table_text"><b>{props.username} invited you to play {props.title}</b></td>
            <td className="friends_td"><Link to={"/multiplayer/game-" + props.gameUrl}><button onClick={() => props.accept(props.gameUrl, props.username)} className="action_button accept_button"></button></Link></td>
            <td className="friends_td"><button onClick={() => props.decline(props.gameUrl, props.username)} className="action_button decline_button"></button></td>
        </tr>
    );
}

export default InviteGameItem;