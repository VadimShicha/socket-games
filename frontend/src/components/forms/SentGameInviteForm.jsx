import React, {useEffect, useState, useRef, createRef} from 'react';
import {Link} from 'react-router-dom';
import DataManager from '../../dataManager';
import './SentGameInviteForm.css';

class SendFriendRequestForm extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = {opacity: 0, hidden: true, username: "", gameName: ""};
        this.showTimeoutID = null;
    }

    setHiddenAfterHide(_this)
    {
        _this.setState({opacity: 0, hidden: true, username: "", gameName: ""});
    }

    hide(_this)
    {
        if(this.showTimeoutID != null)
        {
            clearTimeout(this.showTimeoutID);
            this.showTimeoutID = null;
        }

        _this.setState({opacity: 0, hidden: false, username: _this.state.username, gameName: _this.state.gameName});

        setTimeout(this.setHiddenAfterHide, 500, this);
    }

    show(gameName, username)
    {
        this.setState({opacity: 1, hidden: false, username: username, gameName: gameName});

        this.showTimeoutID = setTimeout(this.hide, 5000, this);
    }

    render()
    {
        return (
            <div hidden={this.state.hidden}>
                <div style={{opacity: this.state.opacity}} className="form_template center_align sent_game_invite_form">
                    <p><b>{this.state.username}</b> invited you to play <b>{this.state.gameName}</b></p>

                    <div className="sent_game_invite_form_actions">
                        <Link to={"/multiplayer/game-" + this.state.gameName.toLowerCase()}><button onClick={() => {this.hide(this); this.props.accept(this.state.gameName, this.state.username)}} className="action_button accept_button"></button></Link>
                        <button onClick={() => {this.hide(this); this.props.decline(this.state.gameName, this.state.username)}} className="action_button decline_button"></button>
                    </div>
                </div>
            </div>
        );
    }
}

export default SendFriendRequestForm;