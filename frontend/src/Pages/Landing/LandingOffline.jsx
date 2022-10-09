import { SystemAppBar } from "Components";
import GenericListPage from "Components/shared/GenericListPage";
import Dexie from "dexie";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { DexDM } from "Utils";

function LandingOffline() {
    const [isFetching, setIsFetching] = useState(false);
    const [manga, setManga] = useState([]);

    useEffect(() => {
        document.title = 'Dexumi';
        fetchManga();
    }, []);
    
    const fetchManga = async () => {
        setIsFetching(true);
        const manga = await DexDM.getDownloadedManga()
        setManga(manga);
        setIsFetching(false);
    }

    return (
        <>
            <SystemAppBar />
            <GenericListPage
                isFetching={isFetching}
                manga={manga}
            />
            {/* <Wrapper className='page fill-screen'>
                <div className='content' >
                </div>
            </Wrapper> */}
        </>
    );
}

const Wrapper = styled.div`
    width: 100%;
    overflow-y: auto;
    a {
        color: inherit;
        text-decoration: none;
    }

    .content {
        padding: 2rem 3rem;
        ${({ theme }) => theme.breakpoints.down('sm')} {
            padding: 2rem 1.2rem;
        }

    }
`;

export default LandingOffline;