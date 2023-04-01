import React, {useEffect, useState} from 'react';
import "../../styles/GameOverForm.css";
import "../../styles/FormTemplate.css";
import { Link } from 'react-router-dom';

function InviteGameForm(props)
{
    return (
        <div hidden={props.status == -1} className="game_over_form_div">
            <div className="form_template center_align game_over_form">
                <h2>{props.status != -1 ? props.statusMessage : ""}</h2>
                <button onClick={props.close} className="form_template_close_button action_button decline_button"></button>
                <button onClick={props.rematch} className="form_template_button">Rematch</button>
                <Link to="/"><button className="form_template_button">Return Home</button></Link>
                
            </div>
        </div>
        
    );
}

export default InviteGameForm;