import React, { useEffect, useState } from "react";
import { getCategory } from "../../api/user/Category";

const CategoryFilter = ({ onCategoryChange }) => {
  const [categories, setCategories] = useState([]);


  useEffect(() => {
    fetchCategory();
  }, []);

  const fetchCategory = async () => {
    try {
      const response = await getCategory();
      if (response) {
        setCategories(response.categories);
      }
    } catch (error) {
      console.log("Error fetching categories:", error);
    }
  };

 
  const handleCheckboxChange = (category, isChecked) => {
    onCategoryChange(category, isChecked); 
  };

  return (
    <section className="category-filter w-[300px] px-4">
      <div className="category-section">
        <p className="category-title font-medium mb-3">CATEGORIES</p>
        {categories?.map((category, index) => (
          <div key={index} className="category-item flex items-center justify-between mb-2">
            <div className="flex items-center" style={{display:"flex"}}>
              <input
                type="checkbox"
                className="checkbox mr-2"
                onChange={(e) => handleCheckboxChange(category._id, e.target.checked)}
              />
              <p className="category-name">{category.name}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategoryFilter;
