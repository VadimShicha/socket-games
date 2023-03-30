import React from 'react';
import '../styles/PopText.css';

class PopText extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = {opacity: 0, hidden: true, text: ""};
    }

    setHiddenAfterHide()
    {
        this.setState({opacity: 0, hidden: true, text: ""});
    }

    hide(text)
    {
        this.setState({opacity: 0, hidden: false, text: text});

        setTimeout(this.setHiddenAfterHide.bind(this), 1000);
    }

    show(text)
    {
        this.setState({opacity: 1, hidden: false, text: text});

        setTimeout(this.hide.bind(this), 1000, text);
    }

    render()
    {
        return (
            <div className="center_align pop_text" hidden={this.state.hidden} style={{opacity: this.state.opacity}}>
                <p>{this.state.text}</p>
            </div>
        );
    };
}

export default PopText;