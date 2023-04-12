import React from 'react';
import GameItem from '../../components/GameItem';
import NavBar from '../../components/NavBar';
import '../../styles/GameListPage.css';
import AuthUser from '../../components/AuthUser';

function GameListPage()
{
    return (
        <>
            <NavBar page={0}></NavBar>
            <div className="nav_bar_body">
                <h2>Select a Game to Play!</h2>
                <div className="game_items">
                    <GameItem info={"The first game on this app."} gameUrl="first" imgURL="/assets/first_game_image.png" title="First Game"></GameItem>
                    
                    <span>
                        <GameItem info={"Make crates go flying!"} gameUrl="sling" imgURL="/assets/sling_game_image.png" title="Sling"></GameItem>
                    </span>
                    <span>
                        <GameItem info={"Camera follow test game"} gameUrl="camera" imgURL="/assets/camera_game_image.svg" title="Camera Follow Test"></GameItem>
                    </span>

                    <GameItem info={"Racing"} gameUrl="racing" imgURL="/assets/racing_game_image.svg" title="Racing Game"></GameItem>
                </div>
            </div>
        </>
    )
}

export default GameListPage;