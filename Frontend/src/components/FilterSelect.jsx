import axios from 'axios';
import Select from 'react-select';
import { useState } from 'react';

const options = [
    { value: "popularity", label: "Popularity" },
    { value: "priceLowToHigh", label: "Price: Low to High" },
    { value: "priceHighToLow", label: "Price: High to Low" },
    { value: "newArrivals", label: "New Arrivals" },
    { value: "aToZ", label: "A - Z" },
    { value: "zToA", label: "Z - A" },
];

const customStyles = {
    control: (provided) => ({
        ...provided,
        backgroundColor: "#0f3460",
        color: "white",
        borderRadius: "5px",
        border: "none",
        boxShadow: "none",
        width: "200px",
        height: "40px",
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? "#0f3460" : "white",
        color: state.isSelected ? "white" : "#0f3460",
        "&:hover": {
            backgroundColor: "#0f3460",
            color: "white",
        },
    }),
    singleValue: (provided) => ({
        ...provided,
        color: "white",
    }),
};

        const FilterSelect = ({ onSortChange }) => {
        const [loading,setLoading]=useState(false)
        const handleChange = (selectedOption) => {
          onSortChange(selectedOption.value); 
        };

    return (
        <div>
            {loading && <p>Loading...</p>}
            <Select
                options={options}
                defaultValue={{ value: "", label: "Filter" }}
                styles={customStyles}
                onChange={handleChange}
            />
        </div>
    );
};

export default FilterSelect;
