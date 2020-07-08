import React, { useContext } from 'react';
import { Context } from '../../Store/store'
import { BasicContainer } from '../../Components/Containers';

export const Home = (props) => {

    const { Theme } = useContext(Context);
    const { pages: { home } } = Theme;


    return (
        <>
            <BasicContainer theme={home.basicContainer}>
                Home
            </BasicContainer>
        </>
    )
}