import { useCallback, useEffect, useRef, useState } from "react";
import { debounce } from "Utils";

export const useScrollPosition = () => {
    const [scroll, setScroll] = useState([]);
    const elmRef = useRef(null);
    const scrollRef = useRef(null);
    const refCb = useCallback((elm) => {
        elmRef.current = elm;

        var scroller = elm;
        while (scroller && scroller.scrollHeight <= scroller.clientHeight) {
            scroller = scroller.parentElement;
        }
        if(!scroller) return;
        scrollRef.current = scroller;
        scroller.addEventListener('scroll', setScrollState);
    }, []);
    
    
    useEffect(() => {       
        return () => {
            var scroller = scrollRef.current;
            if (!scroller) return;
            scroller.removeEventListener('scroll', setScrollState);
        }
    }, []);

    const setScrollState = useCallback(debounce(() => {
        var elm = elmRef.current;
        if (!elm) return;
        const box = elm.getBoundingClientRect();
        setScroll([
            box.top,
            box.left
        ]);
    }, 200));

    return [scroll, refCb];
    
    
}