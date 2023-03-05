import React, {useState, useEffect} from 'react';
import InviteGame from './InviteGame';
import {sendPOST} from '../tools'

function GameItem(props)
{
    const [inInfo, setInInfo] = useState(false);
    const [infoText, setInfoText] = useState("Info");
    const [playText, setPlayText] = useState("Play");

    function play()
    {
        if(props.multi)
            props.play(props.name);
        else
            window.location.href = "/game-" + props.gameURL;
    }

    function info()
    {
        if(inInfo)
            setInfoText("Info");
        else
            setInfoText("Back");
        
        setInInfo(!inInfo);
    }

    useEffect(() =>
    {
        setPlayText(props.multi ? "Invite" : "Play");
    }, [props.multi]);

    return (
        <div className="game_item">
            <div>
                <img hidden={inInfo != false} style={{border: "3px solid black"}} width="225" height="150" src={props.imgURL}></img>
                <div hidden={inInfo != true} style={{border: "3px solid black", width: "225px", height: "150px"}}>
                    <textarea readOnly style=
                    {
                        {
                            textAlign: "center",
                            padding: "0px",
                            resize: "none",
                            outline: "none",
                            border: "none",
                            width: "225px",
                            height: "150px"
                        }
                    } defaultValue={props.info}></textarea>
                </div>
            </div>
            
            <br></br>
            <h4 style={{display: "inline"}}>{props.name}</h4><br></br><br></br>
            <button style={{width: "fit-content", margin: "5px"}} onClick={play}>{playText}</button>
            <button style={{width: "fit-content"}} onClick={info}>{infoText}</button>
        </div>
    );
}

export default GameItem;