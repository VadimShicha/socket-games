import React, {useState, useEffect} from 'react';
import "../styles/GameItem.css";
import { Navigate } from 'react-router';

function GameItem(props)
{
    const [inInfo, setInInfo] = useState(false);
    const [infoText, setInfoText] = useState("Info");
    const [playText, setPlayText] = useState("Play");

    const [shouldRedirect, setShouldRedirect] = useState(false);

    function play()
    {
        if(props.multi)
            props.play(props.gameUrl);
        else
            setShouldRedirect(true);
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
        <div className="game_item_div">
            {shouldRedirect && <Navigate to={"/game-" + props.gameUrl}></Navigate>}
            <div className="game_item_frame_div">
                <img className="game_item_frame" hidden={inInfo != false} src={props.imgURL}></img>
                <div className="game_item_frame" hidden={inInfo != true}>
                    <textarea className="game_item_textarea" readOnly defaultValue={props.info}></textarea>
                </div>
            </div>
            
            <br></br>
            <h4 className="game_item_name">{props.title}</h4><br></br><br></br>
            <button className="game_item_play_button" hidden={props.playHidden} onClick={play}>{playText}</button>
            <button className="game_item_info_button" onClick={info}>{infoText}</button>
        </div>
    );
}

export default GameItem;