import React, { useState, useEffect } from "react";
import './styles.css'
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Navbar from "../Header/Navbar";
import Sidebar from "../ProfileCard/Sidebar";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import axios from "axios";
import { toast } from "react-toastify";
import Footer from "../Footer/Footer";

export default function AddressCard() {
  const [openModal, setOpenModal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [address, setAddress] = useState([]);
  const [formData, setFormData] = useState({
    _id:"",
    fullname: "",
    phone: "",
    street: "",
    village: "",
    country: "",
    pincode: "",
    defaultAddress: false,
  });
  const [loading, setLoading] = useState(false);

  const userId = localStorage.getItem("userId");

  const fetchAddress = async () => {
    console.log('address fetched');
    try {
      const token = localStorage.getItem("userToken");
      const response = await axiosInstance.get(`/api/user/address/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (response.status === 200 && Array.isArray(response.data.address)) {
        setAddress(response.data.address);
      } else {
        setAddress([]); 
            }
    } catch (error) {
      console.log("Error fetching address:", error.response?.data?.message);
      setAddress([]); 
    }
  };

  useEffect(() => {
    fetchAddress();
  }, [userId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    setFormData({ ...formData, defaultAddress: e.target.checked });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.fullname.trim() ||
      !formData.phone.trim() ||
      !formData.street.trim() ||
      !formData.village.trim() ||
      !formData.country.trim() ||
      !formData.pincode.trim()
    ) {
      toast.error("All fields are required");
      return;
    }
    if (formData.pincode.length < 6) {
      toast.error("PIN code should have 6 characters");
      return;
    }
    if (formData.phone.length < 10) {
      toast.error("Phone number should have 10 characters");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("userToken");
      const response = await axiosInstance.post(
        `/api/user/address/${userId}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        setOpenModal(false);
        setAddress((prevState) => [...prevState, response.data.newAddress]); // Directly update the address list
        toast.success("New address added successfully");
      }
    } catch (error) {
      setLoading(false);
      toast.error("Failed to add new address");
    } finally {
      setLoading(false);
    }
};

  
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullname.trim() || !formData.phone.trim() || !formData.street.trim() || !formData.village.trim() || !formData.country.trim() || !formData.pincode.trim()) {
      toast.error("All fields are required");
      return;
    }
    if (formData.pincode.length < 6) {
      toast.error("PIN code should have 6 characters");
      return;
    }
    if (formData.phone.length < 10) {
      toast.error("Phone number should have 10 characters");
      return;
    }
  
    try {
      setLoading(true);
      const token = localStorage.getItem("userToken");
      const response = await axiosInstance.put(`/api/user/address/${formData._id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
  
      if (response.status === 200) {
        toast.success("Address updated successfully");
        setEditModalOpen(false);
  
        setAddress((prevAddresses) =>
          prevAddresses.map((addressItem) =>
            addressItem._id === formData._id
              ? { ...addressItem, ...response.data.updatedAddress } 
              : addressItem
          )
        );
        fetchAddress()
        
      }
    } catch (error) {
      setLoading(false);
      console.error("Error during update:", error);
      toast.error("Failed to update address");
    } finally {
      setLoading(false);
    }
  };
  

  const handleDeleteSubmit = async (addressId) => {
    try {
      const token = localStorage.getItem("userToken");
      const response = await axiosInstance.delete(`/api/user/address/${addressId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        toast.success("Address deleted successfully");
        setAddress((prevState) => prevState.filter((item) => item._id !== addressId));
      }
    } catch (error) {
      toast.error("Failed to delete address");
    }
  };

  return (
    <div style={{ width: "100vw" ,  marginBottom:"500px"}}>
      <Navbar />
      <Sidebar />
  
  <div className="addbtn-div">
  <button className="addBtn" onClick={() => setOpenModal(true)}>Add Address</button>
</div>

{Array.isArray(address) &&address.length > 0 ? (
  address.map((addressItem) => (
    <div key={addressItem?._id} className="content">
      <div className="header">
        <img
          src="https://via.placeholder.com/60" 
          alt="User Avatar"
          className="avatar"
        />
        <div className="info">
          <h4>{addressItem?.fullname}</h4>
          <p className="location">Village: {addressItem?.village}</p>
        </div>
      </div>

      <div className="address-details">
        <p><strong>Street:</strong> {addressItem?.street}</p>
        <p><strong>Country:</strong> {addressItem?.country}</p>
        <p><strong>Mobile:</strong> {addressItem?.phone}</p>
        <p><strong>PIN Code:</strong> {addressItem?.pincode}</p>
      </div>

      <div className="btn-group">
        <button className="btn" onClick={() => { setFormData(addressItem); setEditModalOpen(true); }}>Edit</button>
        <button className="btn" onClick={() => handleDeleteSubmit(addressItem._id)}>Delete</button>
      </div>
    </div>
  ))
) : (
  <p>No addresses found.</p>
)}

  
      {/* Add Address Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>Add New Address</DialogTitle>
        <DialogContent>
          <TextField label="Full Name" name="fullname" value={formData.fullname} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Phone" name="phone" value={formData.phone} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Street" name="street" value={formData.street} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Village" name="village" value={formData.village} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Country" name="country" value={formData.country} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} fullWidth margin="normal" />
          <FormControlLabel control={<Checkbox checked={formData.defaultAddress} onChange={handleCheckboxChange} />} label="Make this the default address" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button onClick={handleAddSubmit} disabled={loading}>
            {loading ? "Adding..." : "Add Address"}
          </Button>
        </DialogActions>
      </Dialog>
  
      {/* Edit Address Modal */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <DialogTitle>Edit Address</DialogTitle>
        <DialogContent>
          <TextField label="Full Name" name="fullname" value={formData.fullname} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Phone" name="phone" value={formData.phone} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Street" name="street" value={formData.street} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Village" name="village" value={formData.village} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Country" name="country" value={formData.country} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} fullWidth margin="normal" />
          <FormControlLabel control={<Checkbox checked={formData.defaultAddress} onChange={handleCheckboxChange} />} label="Make this the default address" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} disabled={loading}>
            {loading ? "Updating..." : "Update Address"}
          </Button>
        </DialogActions>
      </Dialog>
    
    </div>

 
  );
  }
  