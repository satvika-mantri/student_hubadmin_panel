import React from 'react';
import { Search } from 'lucide-react';

const SearchFilter = ({ searchColumn, setSearchColumn, searchInput, setSearchInput, handleSearch, handleClear, options, isSearchActive }) => {
  return (
    <form onSubmit={handleSearch} className="search-form" style={{ display: "flex", gap: "12px", marginBottom: "20px", alignItems: "center" }}>
      <select
        value={searchColumn}
        onChange={(e) => setSearchColumn(e.target.value)}
        className="search-select"
        style={{
          padding: "8px 12px",
          borderRadius: "6px",
          border: "1px solid var(--border-color, #333)",
          backgroundColor: "var(--card-bg, #1a1a1a)",
          color: "var(--text-color, #fff)",
          outline: "none",
          width: "180px",
          minWidth: "180px"
        }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <input
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder={`Search by ${searchColumn}...`}
        style={{ flex: 1 }}
      />
      <button type="submit" className="btn btn-primary" style={{ minWidth: "110px" }}>
        <Search size={16} /> Search
      </button>

      {isSearchActive && (
        <button type="button" onClick={handleClear} className="btn btn-secondary">
          Clear
        </button>
      )}
    </form>
  );
};

export default SearchFilter;
