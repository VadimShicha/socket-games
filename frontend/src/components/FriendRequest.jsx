import React from 'react';

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
        <tr className="friends_tr">
            <td className="friends_td friends_table_text"><b>{props.username}</b></td>
            <td className="friends_td"><button onClick={() => accept()} className="action_button accept_button"></button></td>
            <td className="friends_td"><button onClick={() => decline()} className="action_button decline_button"></button></td>
        </tr>
    );
}

export default FriendRequest;