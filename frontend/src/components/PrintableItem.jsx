import React from 'react';
import {Link} from 'react-router-dom';
import "../styles/GameItem.css";

function PrintableItem(props)
{
    return (
        <div className="game_item_div">
            <img alt={props.title + " icon"} className="game_item_frame" src={props.imgURL}></img>
            
            <br></br>
            <h4 className="game_item_name">{props.title}</h4><br></br><br></br>
            <button className="game_item_play_button">
                <Link to={props.url}>Play</Link>
            </button>
        </div>
    );
}

export default PrintableItem;