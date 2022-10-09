import { List, TablePagination } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { ChapterListItem } from './ChapterListItem';

function ChaptersTab(props) {

    const chapterList = props.chapters?.reduce((acc, c, idx) => {
        acc[acc.length] = (
            <ChapterListItem
                key={c.id}
                {...props}
                chapter={c}
            />
        );
        return acc;
    }, []);


    return (
        <StyledList>
            {props.fetching ? Array.from(Array(10), (e, idx) => (
                <Skeleton key={idx} variant="rect" height={64} />
            )) :
                <>
                    {chapterList}
                </>
            }
            {props.totalChapterCount &&
                <TablePagination
                    component="div"
                    count={props.totalChapterCount}
                    page={props.page}
                    onPageChange={props.onPageChange}
                    rowsPerPage={props.rowsPerPage}
                    onRowsPerPageChange={props.onRowsPerPageChange}
                />
            }
        </StyledList>
    );
}


const StyledList = styled(List)`
    display: flex;
    flex-direction: column;

    .MuiTablePagination-root {
        margin-top: auto;
    }
    
    .MuiSkeleton-root {
        margin-bottom: .4rem;
    }
`;




ChaptersTab.propTypes = {
    fetching: PropTypes.bool,
    chapters: PropTypes.array,
    readership: PropTypes.object,
    totalChapterCount: PropTypes.number,
    chapterPage: PropTypes.number,
    rowsPerPage: PropTypes.number,
    chapterSettings: PropTypes.object,
    handleChangePage: PropTypes.func,
    handleChangeRowsPerPage: PropTypes.func,
    handleChapterClick: PropTypes.func,
}

export default ChaptersTab;

