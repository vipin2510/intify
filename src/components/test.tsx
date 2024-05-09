<div className="w-full flex flex-col flex-wrap p-2 gap-2">
        {selectedFilters
          ? Object.keys(selectedFilters).map((selected) => (
              <div key={selected} className="flex flex-col gap-y-2">
                <AutocompleteInput
                  id={selected}
                  label={SpacedNamed(selected)}
                  value={selectedFilters[selected as keyof typeof selectedFilters]?.toString() || ''}
                  onChange={(value) => handleChange(value, selected)}
                  suggestions={getSuggestions(selected)}
                />
              </div>
            ))
          : <p>No Filters Selected</p>}
      </div>