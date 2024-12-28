import React, { useEffect, useState } from "react";
import Navbar from '../Navbar-Admin/Header';
import { createOffer, editOffer, getOffer } from "../../../api/admin/Offer";  // Ensure this is correct
import axiosInstance from "../../../api/axiosInstance";
import { toast } from "react-toastify";
import './offer.css';
import { deActivate } from "../../../api/admin/Offer";

function OfferManagment() {
  const [isOpen, setIsOpen] = useState(false);
  const [offers, setOffer] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]); 
  const [editOfferData,setEditOfferData]=useState([])
  const [isCategorySelected,setIsCategorySelected]=useState(false)
  const [isProductSelected,setIsProductSelected]=useState(false)
  const [offerData, setOfferData] = useState({
    name: '',
    discountType: 'percentage',
    discountValue: '',
    startDate: '',
    endDate: '',
    categories: [],
    products: [],
  });
  const token = localStorage.getItem('adminToken');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOfferData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
    setOfferData((prevData) => ({
      ...prevData,
      [name]: selectedValues,
    }));
    
    if(name==="categories" && selectedValues.length>0){
      setIsCategorySelected(true)
      setIsProductSelected(false)
      setOfferData((prevData)=>({...prevData,products:[]}))
    }else if(name==="products" && selectedValues.length>0){
      setIsProductSelected(true)
      setIsCategorySelected(false)
      setOfferData((prevData) => ({ ...prevData, categories: [] }));
    }else{
      setIsCategorySelected(false)
      setIsProductSelected(false)
    }
  };

  const openModal = () => {
    setOfferData({
      name: '',
      discountType: 'percentage',
      discountValue: '',
      startDate: '',
      endDate: '',
      categories: [],
      products: [],
    });
    setEditOfferData(null);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    fetchOffer();
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchOffer = async () => {
    try {
      const response = await getOffer();
      console.log(response);
      
      if (response) {
        setOffer(response);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCategories = async () => {
    try {
      const categories = await axiosInstance.get("/api/admin/categories", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (categories.status === 200) {
        setCategories(categories.data.categories);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.get('/api/admin/product', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        setProducts(response.data.allProduct);
      }
    } catch (error) {
      console.log(error);
      toast.error('Error fetching products');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      let response;
      if (editOfferData) {
        response = await editOffer(editOfferData._id, offerData);
        console.log(response);
        
     if(response){
      toast.success('Offer edited successfully');
     }
      } else {
        response = await createOffer(offerData);
        if(response){
          toast.success("Offer created succefully")
        }
      }
  
      if (response) {
        setOfferData({
          name: '',
          discountType: 'percentage',
          discountValue: '',
          startDate: '',
          endDate: '',
          categories: [],
          products: [],
        });
        fetchOffer();
        closeModal();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to process offer");
    }
  };
  

  const handleDeactivate=async (offerId)=>{
      try{
        const response=await deActivate(offerId)
        if(response){
          toast.success("Offer status updated successfully")
          fetchOffer()
        }
      }catch(error){
       console.log(error);
      }
  }

   const handleEdit=(offerId)=>{
    const offerToEdit =offers.find((item)=>item._id === offerId);
    setOfferData({
      name: offerToEdit.name,
      discountType: offerToEdit.discountType,
      discountValue: offerToEdit.discountValue,
      startDate: offerToEdit.startDate.substring(0, 10),
      endDate: offerToEdit.endDate.substring(0,10),
      categories: offerToEdit.categories.map((c) => c._id),
      products:offerToEdit.products.map((p) => p._id),
    })
    setEditOfferData(offerToEdit)
    setIsOpen(true)
   }

  return (
    <>
      <Navbar />
      <div className="offer-container">
        <button onClick={openModal} className="add-offer-btn">
          Add Offer
        </button>

        <div className="offers-table" style={{ width: '75%', marginLeft: '20%', marginBottom: "6%" }}>
          {offers.length > 0 ? (
            <table className="table table-light table-striped rounded" style={{ borderCollapse: 'collapse' }}>
              <caption style={{ captionSide: 'top' }}>OFFER MANAGEMENT</caption>
              <thead className="table-dark py-3">
                <tr className="py-3">
                  <th>Name</th>
                  <th>Discount Type</th>
                  <th>Discount Value</th>
                  <th>Applied Products</th>
                  <th>Applied categories</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {offers.map((item) => (
                  <tr key={item._id}>
                    <td className="py-4 ps-3" style={{ border: 'none' }}>{item.name}</td>
                    <td className="py-3" style={{ border: 'none' }}>{item.discountType}</td>
                    <td className="py-3" style={{ border: 'none' }}>{item.discountValue}</td>

                    <td className="py-3" style={{ border: 'none' }}>
                    {item.products.map((category) => (
          <div key={category._id}>{category.name}</div>
        ))}
                    </td>
                    <td className="py-3" style={{ border: 'none' }}>
                    {item.categories.map((category) => (
          <div key={category._id}>{category.name}</div>
        ))}
                    </td>
                    <td className="py-4" style={{ border: 'none' }}>{new Date(item.startDate).toLocaleDateString()}</td>
                    <td className="py-4" style={{ border: 'none' }}>{new Date(item.endDate).toLocaleDateString()}</td>
                    <td className="py-4" style={{ border: 'none', color: item.isActive ? "green" : "red" }}>
                      {item.isActive ? "Active" : "Inactive"}
                    </td>
                    <td className="py-3" style={{ border: 'none'  }}>
                      <button className="dlt-btn"  style={{backgroundColor: item.isActive ? "brown" :"green" }} onClick={() => handleDeactivate(item._id)}>{item.isActive ? "DEACTIVATE" : "ACTIVATE"}</button>
                    </td>
                    <td className="py-3" style={{ border: 'none' }}>
                      {item.isActive && (<button className="btn btn-primary mx-2" onClick={() => handleEdit(item._id)}>Edit</button>)}
                      
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No offers available</p>
          )}
        </div>

        {isOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Create Offer</h2>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <label className="form-label">
                  Offer Name
                  <input type="text" name="name" value={offerData.name} onChange={handleInputChange} placeholder="Enter offer name" className="form-input" />
                </label>

                <label className="form-label">
                  Discount
                  <input type="number" name="discountValue" value={offerData.discountValue} onChange={handleInputChange} placeholder="Enter discount value" className="form-input" />
                </label>

                <label className="form-label">
                  Discount Type
                  <select name="discountType" value={offerData.discountType} onChange={handleInputChange} className="form-input">
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </label>

                <label className="form-label">
                  Categories
                  <select name="categories" multiple onChange={handleSelectChange} value={offerData.categories} className="form-input" disabled={isProductSelected}>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-label">
                  Products
                  <select name="products" multiple onChange={handleSelectChange} value={offerData.products} className="form-input" disabled={isCategorySelected}>
                    {products.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-label">
                  Start Date
                  <input type="date" name="startDate" value={offerData.startDate} onChange={handleInputChange} className="form-input" />
                </label>

                <label className="form-label">
                  End Date
                  <input type="date" name="endDate" value={offerData.endDate} onChange={handleInputChange} className="form-input" />
                </label>

                <button type="submit" className="btn">{editOfferData? "Update offer" : "Create Offer"}</button>
                <button type="button" className="btn" onClick={closeModal}>Cancel</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default OfferManagment;
