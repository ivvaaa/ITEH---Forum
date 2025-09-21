export const SearchIcon = (props = {}) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
        <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.8" />
        <line x1="15.5" y1="15.5" x2="20" y2="20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
);

export const CarIcon = (props = {}) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
        <path
            d="M4 15h1.3l1.3-3.9A3 3 0 019.6 9h4.8a3 3 0 012.9 2.1L18.7 15H20a1 1 0 011 1v3h-2v2h-2v-2H7v2H5v-2H3v-3a1 1 0 011-1z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <circle cx="8" cy="17.5" r="1.5" fill="currentColor" />
        <circle cx="16" cy="17.5" r="1.5" fill="currentColor" />
    </svg>
);

export const FilterIcon = (props = {}) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
        <path d="M4 5h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M7 12h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M10 19h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);

export const HeartIcon = ({ filled = false, ...props } = {}) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
        <path
            d="M12 21s-6.2-4.35-9-7.74C-1.1 9 1.3 4.5 5.5 4.5a4.5 4.5 0 016.5 3.3A4.5 4.5 0 0118.5 4.5c4.2 0 6.6 4.5 2.5 8.76C18.2 16.65 12 21 12 21z"
            fill={filled ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);
export const EyeIcon = ({ crossed = false, ...props } = {}) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
        <path
            d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
        {crossed ? <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /> : null}
    </svg>
);