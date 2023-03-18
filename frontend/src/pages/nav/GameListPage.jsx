import React from 'react';
import GameItem from '../../components/GameItem';
import NavBar from '../../components/NavBar';
import './GameListPage.css';

function GameListPage()
{
    return (
        <>
            <NavBar page={0}></NavBar>
            <div className="nav_bar_body">
                <h2>Select a Game to Play!</h2>
                <div className="game_items">
                    <GameItem info={"The first game on this app."} gameURL="first" imgURL="/assets/first_game_image.png" name="First Game"></GameItem>
                    <GameItem info={"Make crates go flying!"} gameURL="sling" imgURL="/assets/sling_game_image.png" name="Sling"></GameItem>
                    <GameItem info={"Camera follow test game"} gameURL="camera" imgURL="/assets/example/game_image3.png" name="Camera Follow Test"></GameItem>
                    {/*<GameItem info={"Example Game\n\nSome example text to fill up this textarea element.\n\nJust some more example text to fill more space up.\n\nA scroll bar gets added when you type too much.\n\nLike this"} gameURL="example" imgURL="./example_game_images/game_image2.png" name="Example Title"></GameItem>*/}
                    {/*<GameItem info={"Chess"} gameURL="chess" imgURL="./chess.png" name="Chess"></GameItem>*/}
                </div>
            </div>
        </>
    )
}

export default GameListPage;