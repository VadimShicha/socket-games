import React, {useState} from 'react';
import GameItem from '../../components/GameItem';
import {sendPOST} from '../../tools';
import NavBar from '../../components/NavBar';

function GameListPage()
{
    return (
        <>
            <NavBar page={0}></NavBar>
            <div className="nav_bar_body">
                <h2>Select a Game to Play!</h2>
                <div className="game_items">
                    <GameItem info={"The first game on this app."} gameURL="first" imgURL="./first_game_image.png" name="First Game"></GameItem>
                    <GameItem info={"Make crates go flying!"} gameURL="sling" imgURL="./sling_game_image.png" name="Sling"></GameItem>
                    {/*<GameItem info={"Example Game\n\nSome example text to fill up this textarea element.\n\nJust some more example text to fill more space up.\n\nA scroll bar gets added when you type too much.\n\nLike this"} gameURL="example" imgURL="./example_game_images/game_image2.png" name="Example Title"></GameItem>*/}
                    {/*<GameItem info={"Chess"} gameURL="chess" imgURL="./chess.png" name="Chess"></GameItem>*/}
                </div>
            </div>
        </>
    )
}

export default GameListPage;