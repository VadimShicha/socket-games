import React, {useState, useEffect, useRef} from 'react';
import NavBar from '../components/NavBar';
import {sendPOST} from '../tools'
import GameListPage from './GameListPage';
import SettingsPage from './SettingsPage';

function MainPage()
{
    return (
        <>
            <NavBar></NavBar>
        </>
    )
}

export default MainPage;