import React, {useEffect, useState} from 'react';
import Cookies from 'js-cookie';
import "../../styles/GameOverForm.css";
import "../../styles/FormTemplate.css";

function InviteGameForm(props)
{
    return (
        <div hidden={props.hidden} className="game_over_form_div">
            <div className="form_template center_align game_over_form">
                <h2>You lost</h2>
                <button onClick={props.close} className="form_template_close_button action_button decline_button"></button>
                <button className="form_template_button">Rematch</button>
                <button className="form_template_button">Return Home</button>
                
            </div>
        </div>
        
    );
}

export default InviteGameForm;