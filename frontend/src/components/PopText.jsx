import React, {useEffect, useImperativeHandle, useState, useRef, createRef} from 'react';
import {sendPOST} from '../tools'

class PopText extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = {opacity: 0, text: ""};
    }

    showFrame(that, text)
    {
        that.setState({opacity: 0, text: text});
    }

    show(text)
    {
        this.setState({opacity: 1, text: text});

        setTimeout(this.showFrame, 0.75 * 1000, this, text);
    }

    render()
    {
        return (
            <div style={{opacity: this.state.opacity, transition: "opacity 0.75s ease", backgroundColor: "var(--secondary-color)"}}>
                <p>{this.state.text}</p>
            </div>
        );
    };
}

export default PopText;