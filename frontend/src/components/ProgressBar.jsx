import React from 'react';
import "../styles/ProgressBar.css";

function ProgressBar(props)
{
    return (
        <div className="progress_bar_main" style={{backgroundColor: props.bgColor}}>
            <div className="progress_bar_fill" style={{backgroundColor: props.mainColor, width: props.value + "%"}}></div>
        </div>
    );
}

export default ProgressBar;