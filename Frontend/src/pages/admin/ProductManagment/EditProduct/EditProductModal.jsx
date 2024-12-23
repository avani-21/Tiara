

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EditProductModal.css';
import { toast } from 'react-toastify';

const EditProductModal = ({ isOpen, onClose, productToEdit, refreshProduct }) => {
  if (!isOpen) return null;

  const [productData, setProductData] = useState({
    name: '',
    price: '',
    description: '',
    stock: '',
    images: [],
    isActive: true,
  });
  
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    if (productToEdit) {
      setProductData({
        name: productToEdit.name.trim(),
        price: productToEdit.price,
        description: productToEdit.description.trim(),
        stock: productToEdit.stock,
        images: productToEdit.images,
        isActive: productToEdit.isActive,
      });
      setImagePreviews(productToEdit.images); 
    }
  }, [productToEdit]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [...productData.images, ...files]; 
    setProductData({ ...productData, images: newImages });

    const previews = [...imagePreviews, ...files.map((file) => URL.createObjectURL(file))];
    setImagePreviews(previews);
  };

  const handleRemoveImage = (index) => {
    const updatedImages = productData.images.filter((_, i) => i !== index);
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
    
    setProductData({ ...productData, images: updatedImages });
    setImagePreviews(updatedPreviews);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (parseInt(productData.stock) < 0) {
      toast.error('Stock value cannot be negative');
      return; 
    }

    if (parseInt(productData.price) < 0) {
      toast.error('Price value cannot be negative');
      return; 
    }

    try {
      const formData = new FormData();
      formData.append('name', productData.name);
      formData.append('price', productData.price);
      formData.append('description', productData.description);
      formData.append('stock', productData.stock);
      formData.append('isActive', productData.isActive);

    
      Array.from(productData.images).forEach((file) => {
        formData.append('images', file); 
      });
  

      formData.append('removedImages', JSON.stringify(productToEdit.images.filter((_, i) => !imagePreviews.includes(productToEdit.images[i]))));
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(`/api/admin/product/${productToEdit._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        toast.success('Product updated successfully');
        onClose();
        refreshProduct();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h3>Edit Product</h3>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={productData.name}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>
              Product Description
              <textarea
                rows="3"
                name="description"
                value={productData.description}
                onChange={handleInputChange}
                placeholder="Enter product description"
                required
              />
            </label>
          </div>
          <div>
            <label>Price:</label>
            <input
              type="number"
              name="price"
              value={productData.price}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Stock:</label>
            <input
              type="number"
              name="stock"
              value={productData.stock}
              onChange={handleInputChange}
            />
          </div>

          <label>
            Upload Images
            <input
              type="file"
              name="images"
              multiple
              onChange={handleImageChange}
            />
          </label>

          <div className="image-previews">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="image-preview-container">
                <img
                src={preview.includes('blob:') ? preview : `http://localhost:3009/${preview}`} 
                 alt={`Preview ${index}`} className="image-preview" />
                <button type="button" className='btn' onClick={() => handleRemoveImage(index)}>Remove</button>
              </div>
            ))}
          </div>
          <button type="submit" className='submit-button'>Update</button>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;