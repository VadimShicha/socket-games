import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import NavBar from '../components/NavBar';

function PrintablesPage(props)
{
    return (
        <>
            <NavBar page={-1}></NavBar>
            <div className="nav_bar_body">
                <h2>Printables</h2>
                <p>Find a game to print!</p>

                <Link to="link-numbers">Link the Numbers</Link>
                
            </div>
        </>
    )
}

export default PrintablesPage;