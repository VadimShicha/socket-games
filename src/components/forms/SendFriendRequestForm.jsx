import React, {useEffect, useState, useRef} from 'react';
import {sendPOST} from '../../tools'

function SendFriendRequestForm(props)
{
    const [requestName, setRequestName] = useState("");
    const inputRef = useRef(null);

    //clear elements when the form opens
    useEffect(() =>
    {
        inputRef.current.value = "";
    }, [props.hidden]);

    return (
        <div hidden={props.hidden} className="form_template invite_game_div center_align" style={{width: "400px", height: "250px"}}>
            <h3>Send Friend Request</h3>
            <button onClick={props.close} className="invite_game_div_close action_button decline_button"></button>
            <input ref={inputRef} onChange={(e) => {e.target.value = e.target.value.toLowerCase()}} placeholder="Search Username"></input>
            <button onClick={() => props.search(inputRef.current.value)}>Send Request</button>
            <p>{props.message}</p>
        </div>
    );
}

export default SendFriendRequestForm;