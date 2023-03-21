import React from 'react';

function InviteFriendItem(props)
{
    return (
        <tr className="friends_tr">
            <td className="friends_td friends_table_text"><b>{props.username}</b></td>
            <td className="friends_td"><button onClick={() => props.send(props.username)} className="accept_button action_button"></button></td>
        </tr>
    );
}

export default InviteFriendItem;
//{/*(props.loading ? "loading_button" : "accept_button") + " action_button" */}