import { useEffect, useState } from 'react';
import '@css/ScrollToTopButton.css';

export default function ScrollToTopButton() {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        setIsVisible(window.scrollY > 100);
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    return (
        isVisible && (
            <button className="scroll-to-top" onClick={scrollToTop} title="맨 위로">
                ⬆
            </button>
        )
    );
}
