import React, {useState, useEffect} from 'react';
import "../styles/GameItem.css";
import { Navigate } from 'react-router';
import Cookies from 'js-cookie';
import {userOnMobile} from "../tools";

function GameItem(props)
{
    const [inInfo, setInInfo] = useState(false);
    const [infoText, setInfoText] = useState("Info");
    const [playText, setPlayText] = useState("Play");

    const [shouldRedirect, setShouldRedirect] = useState(false);

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
        setPlayText(props.multi ? "Play random" : "Play");
    }, [props.multi]);

    function playSingleGame()
    {
        if(userOnMobile())
            alert("This game is not supported on mobile devices");
        else
            setShouldRedirect(true)
    }

    return (
        <div className="game_item_div">
            {shouldRedirect && <Navigate to={"/game-" + props.gameUrl}></Navigate>}
            <div className="game_item_frame_div">
                <img alt={props.title + " icon"} className="game_item_frame" hidden={inInfo != false} src={props.imgURL}></img>
                <div className="game_item_frame" hidden={inInfo != true}>
                    <textarea className="game_item_textarea" readOnly defaultValue={props.info}></textarea>
                </div>
            </div>
            
            <br></br>
            <h4 className="game_item_name">{props.title}</h4><br></br><br></br>
            <button className="game_item_play_button" hidden={props.multi} onClick={playSingleGame}>Play</button>
            <button className="game_item_play_button" hidden={!props.multi} onClick={() => props.playRandom(props.gameUrl)}>Play random</button>
            <button className="game_item_play_button" hidden={!props.multi || props.playHidden || Cookies.get("logged_in") !== 'true'} onClick={() => props.play(props.gameUrl)}>Invite</button>
            <button className="game_item_info_button" onClick={info}>{infoText}</button>
        </div>
    );
}

export default GameItem;