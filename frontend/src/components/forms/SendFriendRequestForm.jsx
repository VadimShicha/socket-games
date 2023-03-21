import React, {useEffect, useState, useRef, createRef} from 'react';
import DataManager from '../../dataManager';

function SendFriendRequestForm(props)
{
    const [requestName, setRequestName] = useState("");
    const inputRef = useRef(null);

    //clear elements when the form opens
    useEffect(() =>
    {
        inputRef.current.value = "";
    }, [props.hidden]);

    function link()
    {
        navigator.clipboard.writeText("192.168.0.94:3000/friend_request#user");
        DataManager.popTextRef.current.show("Copied link to clipboard");
        props.close();
    }

    return (
        <div hidden={props.hidden} className="form_template invite_game_div center_align" style={{width: "400px", height: "250px"}}>
            <h3>Send Friend Request</h3>
            <p>Send an invite to a user to start playing together!</p>
            <button onClick={props.close} className="invite_game_div_close action_button decline_button"></button>
            <input ref={inputRef} onChange={(e) => {e.target.value = e.target.value.toLowerCase()}} placeholder="Search Username"></input>
            <button onClick={() => props.search(inputRef.current.value)}>Send Request</button>
            
            <h4>Try Another Way:</h4>
            <button className="action_button link_button" onClick={link}></button>
            <p>{props.message}</p>
            
        </div>
    );
}

export default SendFriendRequestForm;