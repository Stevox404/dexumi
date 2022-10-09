import { Skeleton } from '@material-ui/lab';
import React from 'react';
import styled from 'styled-components';

export function SkeletonListItem(props) {
    return (
        <Wrapper {...props} >
            <div className="cover">
                <Skeleton className='img-sk' variant="rect" />
                <Skeleton className='title-sk' variant="rect" />
            </div>
            <div className="chapters">
                <Skeleton className='chapter-sk' variant="rect" height={32} />
                <Skeleton className='chapter-sk' variant="rect" height={32} />
                <Skeleton className='chapter-sk' variant="rect" height={32} />
            </div>
        </Wrapper>
    );
}


const Wrapper = styled.div`
    display: grid;
    grid-template-columns: 200px 1fr;
    padding: 0.8rem 0;

    .cover {
        display: grid;
        justify-content: center;
        justify-items: center;
        text-align: center;
        .img-sk {
            height: 180px;
            width: 160px;
            margin-bottom: .8rem;
        }
        .title-sk {
            height: 32px;
            width: 124px;
        }
    }
    .chapters {
        display: grid;
        align-content: flex-start;
        align-items: flex-start;
        .chapter-sk {
            width: 100%;
            margin-bottom: .8rem;
        }
    }
`;