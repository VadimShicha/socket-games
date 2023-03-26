import React from 'react';
import {Navigate} from 'react-router-dom';

class RedirectUser extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = {url: "", change: false};
    }

    redirect(url)
    {
        
        this.setState({url: url, change: true});
        this.render();
        this.setState({url: "", change: false});
    }

    render()
    {
        let change = this.state.change;
        let url = this.state.url;

        return (
            <div>
                {change && (
                    <Navigate to={url}></Navigate>
                )}
            </div>
        );
    };
}

export default RedirectUser;