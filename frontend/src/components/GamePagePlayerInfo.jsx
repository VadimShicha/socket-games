import React from 'react';
import "../styles/GamePagePlayerInfo.css";

function GamePagePlayerInfo(props)
{
    return (
        <div className="game_page_player_info" style={props.style}>
            <img srcSet={props.profileImage}></img>
            <p>{props.username}</p>
        </div>
    );
}

export default GamePagePlayerInfo;