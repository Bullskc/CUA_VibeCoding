import { useState, useEffect, useRef } from 'react';

import './Select.scss';

export interface LanguageOption {
  code: string;
  label: string;
  text: string;
}

interface BaseOption {
  code: string;
  label: string;
  text: string;
}

export function Select<T extends BaseOption>({
  value,
  options,
  onChange = () => {},
}: {
  value: T;
  options: T[];
  onChange: (value: T) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const handleSelect = (option: T) => {
    onChange(option);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div data-component="Select" ref={selectRef} className="select-container">
      <div className="selected-option" onClick={() => setIsOpen(!isOpen)}>
        {value.label}
      </div>
      {isOpen && (
        <div className="options-container">
          <div className="options">
            {options.map((option) => (
              <div
                key={option.code}
                className="option"
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
