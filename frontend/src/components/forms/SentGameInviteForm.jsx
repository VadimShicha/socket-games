import React from 'react';
import {Link} from 'react-router-dom';
import DataManager from '../../dataManager';
import './SentGameInviteForm.css';

class SendFriendRequestForm extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = {opacity: 0, hidden: true, username: "", gameUrl: ""};
        this.showTimeoutID = null;
    }

    setHiddenAfterHide()
    {
        this.setState({opacity: 0, hidden: true, username: "", gameUrl: ""});
    }

    hide()
    {
        if(this.showTimeoutID != null)
        {
            clearTimeout(this.showTimeoutID);
            this.showTimeoutID = null;
        }

        this.setState({opacity: 0, hidden: false, username: this.state.username, gameUrl: this.state.gameUrl});

        setTimeout(this.setHiddenAfterHide.bind(this), 500, this);
    }

    show(gameUrl, username)
    {
        this.setState({opacity: 1, hidden: false, username: username, gameUrl: gameUrl});

        this.showTimeoutID = setTimeout(this.hide.bind(this), 5000, this);
    }

    render()
    {
        return (
            <div hidden={this.state.hidden} className="sent_game_invite_form_div">
                <div style={{opacity: this.state.opacity}} className="form_template center_align sent_game_invite_form">
                    <p><b>{this.state.username}</b> invited you to play <b>{DataManager.gameUrlToTitle(this.state.gameUrl)}</b></p>

                    <div className="sent_game_invite_form_actions">
                        <Link to={"/multiplayer/game-" + this.state.gameUrl}><button onClick={() => {this.hide.bind(this); this.props.accept(this.state.gameUrl, this.state.username)}} className="action_button accept_button"></button></Link>
                        <button onClick={() => {this.hide.bind(this); this.props.decline(this.state.gameUrl, this.state.username)}} className="action_button decline_button"></button>
                    </div>
                </div>
            </div>
        );
    }
}

export default SendFriendRequestForm;