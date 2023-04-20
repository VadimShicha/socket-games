import React from 'react';
import "../styles/ToggleSwitch.css";

function ToggleSwitch(props)
{
    return (
        <div>
           <label className="toggle_switch_container">
                <input type="checkbox" defaultChecked={props.defaultChecked} onChange={(e) => props.onChange(e.target.checked)}></input>
                <span className="toggle_switch_slider"></span>
            </label>
        </div>
    );
}

export default ToggleSwitch;