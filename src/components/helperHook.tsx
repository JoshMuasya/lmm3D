import { useEffect, useState } from "react";

export const useIsMobile = (breakpoint = 768) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Set initial value after mount to ensure window is defined
        const checkMobile = () => window.innerWidth < breakpoint;
        setIsMobile(checkMobile());

        const handleResize = () => {
            setIsMobile(checkMobile());
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [breakpoint]);

    return isMobile;
};