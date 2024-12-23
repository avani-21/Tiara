import React, { useState, useEffect } from "react";
import "../CategoryManagment/categoryManagment.css";
import Navbar from '../Navbar-Admin/Header'
import EditCategoryModal from "./EditModal/EditModal";
import AddCategoryModal from "./AddModal/AddCategoryModal";
import axios from 'axios'
import {toast} from 'react-toastify'

function CategoryMangment() {
  const [category, setCategory] = useState([]);
  const [isEditModalOpen,setEditModalOpen]=useState(false)
  const [selectedCategory,setSelectedCategory]=useState(null)
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen,setAddModalOpen]=useState(false)
 

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        console.log(1);
        
        const categories = await axios.get("/api/admin/categories", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(categories.data.categories);
        
        if (categories.status === 200) {
          setCategory(categories.data.categories);
        }
        
      } catch (error) {
        console.log(error);
       
      }
    };
    fetchCategory();
  }, []);

  const handleBlock = async (categoryId, currentStatus) => {
    try {
      const conformation = window.confirm(
        `Are you sure that you want to ${
          currentStatus ? "unblock " : "block"
        } this category`
      );
      if (conformation) {
        const token = localStorage.getItem("adminToken");
        const response = await axios.patch(
          `/api/admin/categories/${categoryId}`,
          { isListed: !currentStatus },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === 200) {
          setCategory((prevCategories) =>
            prevCategories.map((cat) =>
              cat._id === categoryId
                ? { ...cat, isListed: !currentStatus }
                : cat
            )
          );
        }
      }
    } catch (error) {
      console.log("error updating category", error.message);
    }
  };

  const handleEditClick=(category)=>{
     setSelectedCategory(category);
     setEditModalOpen(true)
  }


  const handleEditCategory = async (newName) => {
    try {
      if (!newName) {
        toast.error("Category name cannot be empty");
        return;
      }
  
      const token = localStorage.getItem("adminToken");
      const response = await axios.put(
        `/api/admin/categories/${selectedCategory._id}`,
        { name: newName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (response.status === 200) {
        setCategory((prevCategories) =>
          prevCategories.map((cat) =>
            cat._id === selectedCategory._id ? { ...cat, name: newName } : cat
          )
        );
        setEditModalOpen(false);
        setSelectedCategory(null); // Reset the selected category
        toast.success("Category updated successfully");
      }
    } catch (error) {
      console.log("Error updating category", error.message);
      toast.error("Category update failed. Name might already exist.");
    }
  };
  


  const handleAddCategory = async (newCategory) => {
    try {
      if (!newCategory) {
        toast.error("Category name field is required");
        return;
      }
  
      const token = localStorage.getItem("adminToken");
      const response = await axios.post(
        `/api/admin/categories`,
        { name: newCategory },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (response.status === 200) {
        setCategory((prevCategories) => [...prevCategories, response.data.category]);
        setAddModalOpen(false);
        toast.success("Category added successfully");
      }
    } catch (error) {
      console.log(error.message);
      toast.error("Error adding category. Category may already exist.");
    }
  };
  



  return (
    <>
      <Navbar />
      <div className="category-table-container">
  <h2>CATEGORY MANAGEMENT</h2>
  <div className="table-header">
    <input
      type="text"
      placeholder="Search categories..."
      onChange={(e) => setSearchQuery(e.target.value)}
    />
    <button className="add-btn" onClick={() => setAddModalOpen(true)}>
      Add
    </button>
  </div>
  <table className="content-table">
    <thead>
      <tr>
        <th>Category ID</th>
        <th>Category Name</th>
        <th>Edit</th>
        <th>Status</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      {category && category.length > 0 ? (
        category
          .filter((item) =>
            item.name.toLowerCase().includes(searchQuery?.toLowerCase() || "")
          )
          .map((categories) => (
            <tr
              key={categories._id}
              className={categories.isListed ? "Listed" : "Unlisted"}
            >
              <td>{categories._id}</td>
              <td>{categories.name}</td>
              <td>
                <button className="edit-button" onClick={() => handleEditClick(categories)}>
                  Edit
                </button>
              </td>
              <td className={categories.isListed ? "sufficient-stock" : "low-stock"}>
                {categories.isListed ? "Listed" : "Unlisted"}
              </td>
              <td>
                <button
                  className={
                    categories.isListed ? "deactivate-btn" : "activate-btn"
                  }
                  onClick={() => handleBlock(categories._id, categories.isListed)}
                >
                  {categories.isListed ? "BLOCK" : "UNBLOCK"}
                </button>
              </td>
            </tr>
          ))
      ) : (
        <tr>
          <td colSpan="5">No categories available</td>
        </tr>
      )}
    </tbody>
  </table>
</div>


    <EditCategoryModal
      isOpen={isEditModalOpen}
      onClose={()=>setEditModalOpen(false)}
      categoryName={selectedCategory ?.name || ''}
      onSave={(newName)=>handleEditCategory(newName)}
    />
    
    <AddCategoryModal
     isOpen={isAddModalOpen}
     onClose={()=>setAddModalOpen(false)}
     onSave={handleAddCategory}
    />

    </>
  );
}

export default CategoryMangment;
