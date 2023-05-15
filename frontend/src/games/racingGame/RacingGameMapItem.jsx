import React, {createRef} from 'react';

class RacingGameMapItem extends React.Component
{
    constructor(props)
    {
        super(props);
    };

    render()
    {
        return (
            <button disabled={this.props.amount === -1} onClick={this.props.click}>
                <h1>{this.props.number}</h1>
                <p hidden={this.props.amount === -1}>{this.props.amount}/{this.props.maxAmount}</p>
            </button>
        );
    };
}

export default RacingGameMapItem;