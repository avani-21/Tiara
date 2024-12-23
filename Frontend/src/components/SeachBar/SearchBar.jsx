import { useState } from "react";
import "./searchbar.css";
import { products } from "../../utils/products";


const SearchBar = ({ setSearchQuery }) => {
  const [searchWord, setSearchWord] = useState(null);

   const handleChange=(input)=>{
    const query=input.target.value;
    setSearchWord(query);
    setSearchQuery(query);
   }

  return (
    <div className="search-container">
      <input type="text" placeholder="Search..."  value={searchWord} onChange={handleChange} />
      <ion-icon name="search-outline" className="search-icon"></ion-icon>
    </div>
  );
};

export default SearchBar;
