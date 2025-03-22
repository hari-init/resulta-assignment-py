import React, { useState, useRef, useEffect } from 'react';
import styles from './Select.module.css';
import Image from 'next/image';

interface SelectProps {
    selectedLeague: string;
    handleChange: (league: string) => void;
    leagues: string[];
    label: string;
}

const Select: React.FC<SelectProps> = ({ selectedLeague, handleChange, leagues, label }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Toggle dropdown visibility
    const toggleDropdown = () => {
        setIsOpen((prev) => !prev);
    };

    // Handle league selection
    const handleSelect = (league: string) => {
        handleChange(league);
        setIsOpen(false); // Close dropdown after selection
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className={styles.label} ref={dropdownRef}>
            <p className={styles.labelName}>{label}</p>
            <div className={styles.dropdown}>
                <div
                    className={`${styles.dropdownHeader} ${isOpen ? styles.open : ''}`}
                    onClick={toggleDropdown}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            toggleDropdown();
                        }
                    }}
                >
                    {selectedLeague || 'Select a league'}
                    {isOpen ? (
                        <Image src="/caret-up.svg" alt="Up Arrow" width="26" height="26" />
                    ) : (
                        <Image src="/caret-down.svg" alt="Down Arrow" width="26" height="26" />
                    )}
                </div>
                {isOpen && (
                    <ul className={styles.dropdownList}>
                        {leagues.map((league) => (
                            <li
                                key={league}
                                className={`${styles.dropdownItem} ${selectedLeague === league ? styles.selected : ''
                                    }`}
                                onClick={() => handleSelect(league)}
                                role="option"
                                aria-selected={selectedLeague === league}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        handleSelect(league);
                                    }
                                }}
                            >
                                {league}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Select;
