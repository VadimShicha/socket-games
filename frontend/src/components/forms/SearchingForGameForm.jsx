import React from 'react';
import "../../styles/SearchingForGameForm.css";
import "../../styles/FormTemplate.css";
import { Link } from 'react-router-dom';

function SearchingForGameForm(props)
{
    return (
        <div hidden={props.hidden} className="form_template invite_game_div center_align">
            <h3>Searching for a player</h3>
            <button className="form_template_button">Cancel Search</button>
            <button onClick={props.close} className="form_template_close_button action_button decline_button"></button>
            
        </div>
    );
}

export default SearchingForGameForm;