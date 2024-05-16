import React, { useState } from 'react';
import { Input } from './ui/input';
import { stringToColor } from '@/lib/utils';

interface AutocompleteInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  colorize?: boolean;
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  id,
  label,
  value,
  onChange,
  suggestions,
  colorize = false,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    const filtered = suggestions.filter((suggestion) =>
      suggestion.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredSuggestions(filtered);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <label htmlFor={id}>{label}</label>
      <Input
        id={id}
        onChange={handleInputChange}
        value={value}
        className="border-slate-300"
      />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul
          className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#888 #f1f1f1' }}
        >
          {filteredSuggestions.map((suggestion) => (
            <li
              key={suggestion}
              className="px-4 py-2 cursor-pointer hover:bg-gray-200 flex items-center gap-2"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {colorize && (
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: stringToColor(suggestion) }}
                />
              )}
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};