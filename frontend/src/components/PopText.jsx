import React from 'react';
import './PopText.css';

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

        setTimeout(this.showFrame, 1 * 1000, this, text);
    }

    render()
    {
        return (
            <div className="center_align pop_text" style={{opacity: this.state.opacity}}>
                <p>{this.state.text}</p>
            </div>
        );
    };
}

export default PopText;