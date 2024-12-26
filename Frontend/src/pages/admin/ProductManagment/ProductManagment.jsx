import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ProductManagment.css';
import Navbar from '../../admin/Navbar-Admin/Header';
import AddProductModal from './AddProduct/AddProductModal';
import { toast } from 'react-toastify';
import EditProductModal from './EditProduct/EditProductModal';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [selectedProduct,setSelectedProduct]=useState(null)
  const [editModalOpen,setEditModalOpen]=useState(false)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await axios.get('/api/admin/product', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response.data.allProduct);
        if (response.status === 200) {
          setProducts(response.data.allProduct);
        }
      } catch (error) {
        console.log(error);
        toast.error('Error fetching data');
      }
    };

    fetchProducts();
  }, []);

  const toggleeModal = () => {
    setAddModalOpen((prev) => !prev);
  };

  const refreshProduct = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('/api/admin/product', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        console.log(response.data.allProduct);
        setProducts(response.data.allProduct);
       
      }
    } catch (error) {
      console.error('Error fetching data', error);
      toast.error('Error refetching products');
    }
  };

  const handleEdit=(products)=>{
    console.log('Editing product:',products)
    setSelectedProduct(products);
    setEditModalOpen(true)

  }



  const handleList = async (productId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const product = products.find((product) => product._id === productId);
    
      const confirmation = window.confirm(
        `Are you sure you want to ${product.isListed ? "unlist" : "list"} this product?`
      );
    
      if (confirmation) {
        let response;
        if (product.isListed) {
     
          response = await axios.patch(
            `/api/admin/product/unlist/${productId}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        } else {
        
          response = await axios.patch(
            `/api/admin/product/list/${productId}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }
    
        if (response.status === 200) {
         
          setProducts((prevProducts) =>
            prevProducts.map((p) =>
              p._id === productId ? { ...p, isListed: !p.isListed } : p
            )
          );
        }
      }
    } catch (error) {
      console.log(error.response?.data?.message || "Failed to update product listing");
    }
  };
  
  
  return (
    <>
      <Navbar />
      <div className="product-table-container">
        <h2>Product Management</h2>
        <div className="table-header">
          <input
            type="text"
            placeholder="Search by Product Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="add-btn" onClick={toggleeModal}>Add </button>
        </div>
        <table className="content-table">
          <thead>
            <tr>
              <th>IMG</th>
              <th>PRODUCT</th>
              <th>STOCK</th>
              <th>PRICE</th>
              <th>STATUS</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
  {products && products.length > 0 ? (
    products
      .filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase().trim())

      )
      .map(item => (
        <tr
          key={item._id}
          className={item.isListed ? 'Listed' : 'Unlisted'}
        >
          <td><img src={`${item.images[0]}`} alt="Product Image" style={{width:'100px',height:'100px'}} /></td>                    
          <td>{item.name}</td>
          <td className={item.stock < 10 ? 'low-stock' : 'sufficient-stock'}>{item.stock}</td>
          <td className={item.price > 100 ? 'high-price' : 'low-price'}>{item.price}</td>
          <td>
            {item.isListed ? 'Listed' : 'Unlisted'}
          </td>
          <td>
            <button
              className={item.isListed ? 'Unlist' : 'List'}
              onClick={() => handleList(item._id)}
            >
              {item.isListed ? 'Unlist' : 'List'}
            </button>
            <button className='edit-button' onClick={() => handleEdit(item)}>
              Edit
            </button>
          </td>
        </tr>
      ))
  ) : (
    <tr>
      <td colSpan="6">No products available</td>
    </tr>
  )}
</tbody>

        </table>
      </div>

      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={toggleeModal}
        refreshProduct={refreshProduct}
        productToEdit={selectedProduct}
      />

      <EditProductModal
       isOpen={editModalOpen}
       onClose={()=>setEditModalOpen(false)}
       productToEdit={selectedProduct}
       refreshProduct={refreshProduct}
      />
    </>
  );
};

export default ProductManagement;
