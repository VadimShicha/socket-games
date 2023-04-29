import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import PrintableItem from '../components/PrintableItem';

function PrintablesPage(props)
{
    return (
        <>
            <NavBar page={-1}></NavBar>
            <div className="nav_bar_body">
                <h2>Printables</h2>
                <p>Find a game to print!</p>

                <PrintableItem title="Link the Numbers" url="link-numbers" imgURL="/assets/link_the_numbers.svg"></PrintableItem>
            </div>
        </>
    )
}

export default PrintablesPage;