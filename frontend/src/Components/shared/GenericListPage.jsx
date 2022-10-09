import React from 'react';
import { Skeleton } from '@material-ui/lab';
import styled from 'styled-components';
import MangaCard from 'Components/shared/MangaCard/index';
import PropTypes from 'prop-types';

function GenericListPage(props) {
    return (
        <>
            <Wrapper className='page fill-screen'>
                {props.isFetching ?
                    <>
                        {
                            Array.from(Array(10), (x, idx) => (
                                <Skeleton key={idx} variant="rect" />
                            ))
                        }
                    </> : props.manga?.map((manga, idx) => (
                        <MangaCard
                            key={manga.id}
                            id={manga.id}
                            manga={manga}
                            showPopularity={props.showPopularity}
                            showUpdate={props.showUpdate}
                        />
                    ))
                }
            </Wrapper>
        </>
    );
}

const Wrapper = styled.div`
    --card-height: 20rem;
    --card-width: 16rem;
    display: grid;
    align-items: left;
    grid-template-columns: repeat(auto-fit, 16rem);
    gap: 1rem;
    padding: 1rem;
    justify-content: space-around;
    justify-items: center;
    >*:last-child {
        margin-bottom: 4.8rem;
    }

    .MuiSkeleton-root {
        height: var(--card-height, 13rem);
        width: var(--card-width, 13rem);
    }
    
    ${({ theme }) => theme.breakpoints.down('sm')} {
        grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
        /* --card-height: 14.4rem;
        --card-width: 10.4rem; */
        --card-height: 15rem;
        --card-width: 12rem;
    }
`;

GenericListPage.propTypes = {
    manga: PropTypes.array,
    isFetching: PropTypes.bool,
    showPopularity: PropTypes.bool,
    showUpdate: PropTypes.bool,
}

export default GenericListPage;
