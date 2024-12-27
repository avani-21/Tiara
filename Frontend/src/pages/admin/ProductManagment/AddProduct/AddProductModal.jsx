import React, { useState } from 'react';
import './AddProductModal.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const AddProductModal = ({ isOpen, onClose, refreshProduct}) => {
  const [productData, setProductData] = useState({
    productname: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    discount: '',
    isListed: true,
    images: [],
  });

 

  const [imagePreviews, setImagePreviews] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData({
      ...productData,
      [name]: value,
    });
  };



  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setProductData({
      ...productData,
      images: files,
    });

    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productData.productname || !productData.description || !productData.price || !productData.category || !productData.stock || !productData.images) 
      {
      console.error("All fields must be filled");
      return;
  }

  if (parseInt(productData.stock) < 0) {
    toast.error('Stock value cannot be negative');
    return; 
  }
  if (parseInt(productData.price) < 0) {
    toast.error('Price value cannot be negative');
    return; 
  }
  if (parseInt(productData.discount) < 0) {
    toast.error('Discount value cannot be negative');
    return; 
  }
    const formData = new FormData();
    formData.append('name', productData.productname.trim());
    formData.append('description', productData.description.trim());
    formData.append('price', productData.price.trim());
    formData.append('category', productData.category.trim());
    formData.append('stock', productData.stock.trim());
    formData.append('discount', productData.discount.trim());
    formData.append('isListed', productData.isListed);

    productData.images.forEach((image) => {
      formData.append('images', image);
    });

    try {
      const token =localStorage.getItem('adminToken')
      console.log(token)
      const response = await axiosInstance.post('/api/admin/product', formData, {
        headers: {
          Authorization:`Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
        },
      });
      console.log(response.data)

      if (response.status === 200) {
        toast.success('Product added successfully');
        setProductData({
          productname: '',
          description: '',
          price: '',
          category: '',
          stock: '',
          discount: '',
          isListed: true,
          images: [],
        });
        setImagePreviews([]);
        onClose();
        refreshProduct();
      }
    } catch (error) {
      toast.error('Error adding product');
      console.error(error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Add New Product</h2>
          <button className="close-button" onClick={onClose}>X</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit} className="modal-form">
            <label>
              Product Name
              <input
                type="text"
                name="productname"
                value={productData.productname}
                onChange={handleInputChange}
                placeholder="Product Name"
                required
              />
            </label>

            <label>
              Product Description
              <textarea
                type='textArea'
                rows="3"
                name="description"
                value={productData.description}
                onChange={handleInputChange}
                placeholder="Enter product description"
                required
              />
            </label>

            <label>
              Price
              <input
                type="number"
                name="price"
                value={productData.price}
                onChange={handleInputChange}
                placeholder="Price"
                required
              />
            </label>

            <label>
              Category
              <input
                type="text"
                name="category"
                value={productData.category}
                onChange={handleInputChange}
                placeholder="Category"
                required
              />
            </label>

            <label>
              Stock
              <input
                type="number"
                name="stock"
                value={productData.stock}
                onChange={handleInputChange}
                placeholder="Stock"
                required
              />
            </label>

            <label>
              Discount
              <input
                type="number"
                name="discount"
                value={productData.discount}
                onChange={handleInputChange}
                placeholder="Discount"
              />
            </label>

            <label className="checkbox-container">
              <input
                type="checkbox"
                name="isListed"
                checked={productData.isListed}
                onChange={(e) => setProductData({ ...productData, isListed: e.target.checked })}
              />
              Is Listed
            </label>

            <label>
              Upload Images
              <input
                type="file"
                multiple
                onChange={handleImageChange}
                required
              />
            </label>

            <div className="image-previews">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="image-preview-container">
                  <img
                    src={preview}
                    alt={`Preview ${index}`}
                    className="image-preview"
                  />
                </div>
              ))}
            </div>

            <button type="submit" className="submit-button">Add Product</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
