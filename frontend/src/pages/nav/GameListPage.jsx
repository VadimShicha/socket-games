import React, { useEffect, useState } from 'react';
import GameItem from '../../components/GameItem';
import NavBar from '../../components/NavBar';
import '../../styles/GameListPage.css';

function GameListPage()
{
    const [oldGamesHidden, setOldGamesHidden] = useState(true);

    useEffect(() =>
    {
        let listener = document.addEventListener("keyup", (e) =>
        {
            if(e.shiftKey && e.key == "~")
                setOldGamesHidden(!oldGamesHidden);
        });

        return() => {document.removeEventListener("keyup", listener)};

    }, []);

    return (
        <>
            <NavBar page={0}></NavBar>
            <div className="nav_bar_body">
                <h2>Select a Game to Play!</h2>
                <div className="game_items">
                    <span hidden={oldGamesHidden}>
                        <GameItem info={"The first game on this app."} gameUrl="first" imgURL="/assets/first_game_image.png" title="First Game"></GameItem>
                    </span>
                    <span hidden={oldGamesHidden}>
                        <GameItem info={"Make crates go flying!"} gameUrl="sling" imgURL="/assets/sling_game_image.png" title="Sling"></GameItem>
                    </span>
                    <span hidden={oldGamesHidden}>
                        <GameItem info={"Camera follow test game"} gameUrl="camera" imgURL="/assets/camera_game_image.svg" title="Camera Follow Test"></GameItem>
                    </span>
                    
                    <GameItem info={"A bike game where you can ride and tune your bike!\n\nYour bike uses fuel and you can buy fuel at the gas station with in-game currency."} gameUrl="racing" imgURL="/assets/racing_game_image.svg" title="Racing Game"></GameItem>
                    <GameItem info={"Speedy pizza!"} gameUrl="speedy_pizza" imgURL="/assets/potato_runner_game_image.svg" title="Speedy Pizza"></GameItem>
                </div>
            </div>
        </>
    )
}

export default GameListPage;