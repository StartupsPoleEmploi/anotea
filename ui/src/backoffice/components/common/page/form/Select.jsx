import React, { useState, useEffect, useRef } from 'react';
import './Select.scss';

const Select = ({
  id,
  placeholder,
  trackingId,
  loading,
  value,
  options,
  optionKey,
  optionLabel,
  ariaLabelledby,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [focusedOption, setFocusedOption] = useState(null);
  const comboboxRef = useRef(null);
  const listboxRef = useRef(null);
  const inputRef = useRef(null);
  const optionRefs = useRef({});

  const normalizeString = (str) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  };

  useEffect(() => {
    setFilteredOptions(
      options.filter(option =>
        normalizeString(option[optionLabel]).includes(normalizeString(filter))
      )
    );
  }, [filter, options, optionLabel]);

  useEffect(() => {
    const handleClickOutside = event => {
      if (
        comboboxRef.current &&
        !comboboxRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = event => {
    setFilter(event.target.value);
    setIsOpen(true);
  };

  const handleInputKeyDown = event => {
    let newFocusedOption;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setIsOpen(true);
        if (focusedOption === null) {
          newFocusedOption = 0;
        } else {
          newFocusedOption = (focusedOption + 1) % filteredOptions.length;
        }
        setFocusedOption(newFocusedOption);
        if (optionRefs.current[newFocusedOption]) {
          optionRefs.current[newFocusedOption].scrollIntoView({
            block: 'nearest',
            behavior: 'smooth'
          });
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        setIsOpen(true);
        if (focusedOption === null) {
          newFocusedOption = filteredOptions.length - 1;
        } else {
          newFocusedOption = (focusedOption - 1 + filteredOptions.length) % filteredOptions.length;
        }
        setFocusedOption(newFocusedOption);
        if (optionRefs.current[newFocusedOption]) {
          optionRefs.current[newFocusedOption].scrollIntoView({
            block: 'nearest',
            behavior: 'smooth'
          });
        }
        break;
      case 'Enter':
        event.preventDefault();
        if (isOpen && focusedOption !== null) {
          onChange(filteredOptions[focusedOption]);
          setIsOpen(false);
          setFilter('');
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const handleOptionClick = option => {
    onChange(option);
    setIsOpen(false);
    setFilter('');
  };

  const handleClear = () => {
    setFilter('');
    setIsOpen(false);
    //inputRef.current.focus();
    onChange(null); // Clear the selected value
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setIsOpen(false);
      setFilter('');
    }, 100);

  };
  

  return (
    <div className="combobox combobox-list" ref={comboboxRef}>
      <div className="group">
        <input
          id={id}
          className="cb_edit"
          type="text"
          role="combobox"
          aria-autocomplete="both"
          aria-expanded={isOpen}
          aria-controls={`${id}-listbox`}
          value={value ? options.find(opt => opt[optionKey] === value)?.[optionLabel] : filter}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          ref={inputRef}
        />
        {(filter || value) && (
          <button
            type="button"
            className="clear-button"
            aria-label={"Réinitialiser le filtre"}
            onClick={handleClear}
          >
            <svg
              height="20"
              width="20"
              viewBox="0 0 20 20"
              aria-hidden="true"
              focusable="false"
              className="css-tj5bde-Svg">
              <path
                  d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"></path>
            </svg>
          </button>
        )}
        <button
          type="button"
          id={`${id}-button`}
          aria-label={placeholder}
          aria-expanded={isOpen}
          aria-controls={`${id}-listbox`}
          onClick={() => setIsOpen(!isOpen)}
          aria-hidden="true"
        >
          <svg width="18" height="16" aria-hidden="true" focusable="false">
            <polygon className="arrow" strokeWidth="0" fillOpacity="0.75" fill="currentColor" points="3,6 15,6 9,14" />
          </svg>
        </button>
      </div>
      <ul id={`${id}-listbox`} role="listbox" aria-label={placeholder} className={isOpen ? 'open' : ''} ref={listboxRef}>
        {filteredOptions.length > 0 ? (
          filteredOptions.map((option, index) => (
            <li
              key={option[optionKey]}
              id={`${id}-${option[optionKey]}`}
              role="option"
              aria-selected={index === focusedOption}
              onClick={() => handleOptionClick(option)}
              className={index === focusedOption ? 'focused' : ''}
              ref={el => {
                optionRefs.current[index] = el;
              }}
            >
              {option[optionLabel]}
            </li>
          ))
        ) : (
          <li className="no-results">Aucun résultat</li>
        )}
      </ul>
    </div>
  );
};

export default Select;
