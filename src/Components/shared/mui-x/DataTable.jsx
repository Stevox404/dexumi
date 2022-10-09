import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import Table from '@material-ui/core/Table';
import TableContainer from '@material-ui/core/TableContainer';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Paper from '@material-ui/core/Paper';
import { throttle } from 'Utils';


function DataTable(props) {
    const { headers, rows, columnWidths, stickyColumn } = props;
    let { className } = props;
    const [tableRows, setTableRows] = useState([]);
    const [tableHeaders, setTableHeaders] = useState([]);
    const [colWidths, setColWidths] = useState([])
    const [isScrolled, setIsScrolled] = useState(false);


    const handleTableScroll = e => {
        if(!Number.isInteger(stickyColumn)) return;
        throttle(() => {
            /** @type {HTMLElement} */
            const el = e.target;
            // const lScrolled = el.scrollLeft;
            const lScrolled = el.scrollLeft && 
                Number.parseInt(el.getElementsByClassName('sticky')[0]
                    .getBoundingClientRect().left - el.offsetLeft) === 0;
            if (lScrolled) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        }, 500)();
    }

    useEffect(() => {
        const c_widths = columnWidths || [];
        const t_cols = headers.map((header, i) => {
            if (typeof header === 'object' && header.headerValue) {
                if (header.width) {
                    c_widths[i] = header.width;
                }
                return header.headerValue;
            }

            return header;
        });

        setTableHeaders(t_cols);
        setColWidths(c_widths);
    }, [headers, columnWidths]);


    useEffect(() => {
        const t_rows = rows?.map(row => {
            if (Array.isArray(row)) {
                return row;
            }
        }) || [];

        setTableRows(t_rows);
    }, [rows, tableHeaders]);


    className = (className || '') + ' uiDataTable';

    return (
        <TableContainer component={Paper} square className={className} onScroll={handleTableScroll} >
            <StyledTable className={isScrolled ? 'scrolled' : ''} >
                {!!tableHeaders.length &&
                    <TableHead>
                        <TableRow>
                            {tableHeaders.map((c, i) =>
                                <TableCell
                                    key={c}
                                    style={colWidths[i] && { width: colWidths[i] }}
                                    className={stickyColumn == i ? 'sticky' : ''}
                                >
                                    {c}
                                </TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                }
                {!!tableRows.length &&
                    <TableBody>
                        {tableRows.map((row, i) =>
                            <TableRow
                                key={i}
                                onDoubleClick={e => {
                                    if(props.rowDisabled?.(row, i)) return;
                                    return props.onRowDoubleClick?.(e, row);
                                }}
                                onClick={e => {
                                    if(props.rowDisabled?.(row, i)) return;
                                    return props.onRowClick?.(e, row);
                                }}
                                disabled={props.rowDisabled?.(row, i)}
                            >
                                {row.reduce((acc, data, i) => {
                                    if (data?.hidden) return acc;
                                    return [...acc, (
                                        <TableCell
                                            key={i}
                                            className={stickyColumn == i ? 'sticky' : ''}
                                        >
                                            {data}
                                        </TableCell>
                                    )];
                                }, [])}
                            </TableRow>
                        )}
                    </TableBody>
                }
            </StyledTable>
        </TableContainer>
    )
}



const StyledTable = styled(Table)`
    thead {
        position: sticky;
        top: 0;
    }
    th {
        background-color: ${({ theme }) => theme.palette.grey[200]};
        color: ${({ theme }) => theme.palette.grey[700]};
        font-weight: bold;
    }
    tbody {
        tr{
            position: relative;
            background-color: ${({ theme }) => theme.palette.background.default};
            :nth-child(even){
                background-color: ${({ theme }) => theme.palette.primary.lighter};
            }
            &:hover::after {
                content: '';
                height: 100%;
                width: 100%;
                position: absolute;
                top: 0;
                left: 0;
                background-color: ${({ theme }) => theme.palette.primary.light};
                filter: opacity(15%);
                pointer-events: none;
                z-index: 100;
            }
            &[disabled] {
                background-color: ${({ theme }) => theme.palette.action.disabledBackground};
                opacity: ${({ theme }) => theme.palette.action.disabledOpacity};
                * {
                    color: inherit !important;
                }
                &:hover::after {
                    content: '';
                    background-color: ${({ theme }) => theme.palette.action.disabledBackground};
                    height: 100%;
                    width: 100%;
                    position: absolute;
                    top: 0;
                    left: 0;
                    pointer-events: all;
                    filter: none;
                }
                &::after {
                    content: '';
                    background-color: ${({ theme }) => theme.palette.action.disabledBackground};
                    height: 100%;
                    width: 100%;
                    position: absolute;
                    top: 0;
                    left: 0;
                    pointer-events: all;
                    z-index: 1;
                }
            }
        }
    }
    th{
        white-space: nowrap;
    }
    td{
        padding: 8px 14px;
        white-space: pre-line;
        background-color: inherit;
        >* {
            margin: 0;
        }
    }
    .sticky{
        position: sticky;
        left: 0;
        box-shadow: none;
        z-index: 100;
    }
    &.scrolled .sticky {
        ${({ theme }) => css`
            box-shadow: 1px 1px 1px 0px ${theme.palette.grey[700]};
        `}
    }
`;




DataTable.defaultProps = {
    headers: [],
    rows: [],
}

DataTable.propTypes = {
    headers: PropTypes.arrayOf(PropTypes.oneOfType([
        PropTypes.string, PropTypes.object
    ])),
    /** Each row is an array matching the table headers array */
    rows: PropTypes.arrayOf(PropTypes.array),
    /** Array of widths to be applied to columns */
    columnWidths: PropTypes.arrayOf(PropTypes.string),
    /** Function parameters (clickEvent, clickedRow:{Array|Object}) */
    onRowClick: PropTypes.func,
    /** Function parameters (clickEvent, clickedRow:{Array|Object}) */
    onRowDoubleClick: PropTypes.func,
    /** Column to stick to left edge when scrolling (0 indexed) */
    stickyColumn: PropTypes.number,
    /** Return true to mark row as disabled
     * @param {array} row 
     * @param {Number} index 
     * */
    rowDisabled: PropTypes.func,
}
export default DataTable
