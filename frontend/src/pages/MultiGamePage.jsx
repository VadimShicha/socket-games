import React from 'react';
import NavBar from '../components/NavBar';
import GamePagePlayerInfo from '../components/GamePagePlayerInfo';

function MultiGamePage(props)
{
    return (
        <>
            <NavBar page={-1}></NavBar>
            <GamePagePlayerInfo style={{position: "absolute", top: "45px", left: "5px"}} username={props.usernames[0]} profileImage={props.profileImages[0]}></GamePagePlayerInfo>
            <GamePagePlayerInfo style={{position: "absolute", top: "45px", right: "5px"}} username={props.usernames[1]} profileImage={props.profileImages[1]}></GamePagePlayerInfo>
            <div className="nav_bar_body">

            </div>
        </>
    )
}

export default MultiGamePage;