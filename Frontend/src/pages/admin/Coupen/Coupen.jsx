import React, { useEffect, useState } from "react";
import Navbar from "../Navbar-Admin/Header";
import axios from "axios";
import "./coupen.css";
import { createCoupen, editCoupon, getCoupen,deleteCoupon } from "../../../api/admin/Coupen";
import { toast } from "react-toastify";


function Coupon() {
  const [isOpen, setIsOpen] = useState(false);
  const [coupon, setCoupon] = useState([]);
  const [editCouponData, setEditCouponData] = useState(null);
  const [couponData, setCouponData] = useState({
    code: "",
    discount: "",
    discountType: "percentage",
    minPurchase: "",
    maxUsage: "",
    maxDiscount:"",
    expiresAt: "",
  });

  const [error, setError] = useState("");
  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    fetchCoupen();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCouponData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setError("");
    setEditCouponData(null);
    setCouponData({
      code: "",
      discount: "",
      discountType: "percentage",
      minPurchase: "",
      maxDiscount:"",
      maxUsage: "",
      expiresAt: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();


    if (!couponData.code || !couponData.discount || !couponData.minPurchase || !couponData.expiresAt) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      if (editCouponData) {
        
        await editCoupon(editCouponData._id, couponData);
        toast.success("Coupon updated successfully");
      } else {
      
        await createCoupen(couponData);
        toast.success("Coupon created successfully");
      }

      fetchCoupen();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const fetchCoupen = async () => {
    try {
      const response = await getCoupen();
      if (response) {
        setCoupon(response);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleEdit = (couponId) => {
    const couponToEdit = coupon.find((item) => item._id === couponId);
    setCouponData({
      code: couponToEdit.code,
      discount: couponToEdit.discount,
      discountType: couponToEdit.discountType,
      minPurchase: couponToEdit.minPurchase,
      maxDiscount:couponToEdit.maxDiscount,
      maxUsage: couponToEdit.maxUsage,
      expiresAt: couponToEdit.expiresAt.substring(0, 10),
    });
    setEditCouponData(couponToEdit);
    setIsOpen(true);
  };

  const deActivateCoupen=async (couponId)=>{
   try{
    const response=await deleteCoupon(couponId);
    if(response){
     toast.success("Coupon deActivated suuccessfully")
    }
    fetchCoupen()
   }catch(error){
    console.log(error);
    
   }

  }

  return (
    <>
      <Navbar />
      <div className="coupon-container">
        <button onClick={openModal} className="add-coupon-btn">
          Add Coupon
        </button>

        <div className="coupons-table" style={{ width: "75%", marginLeft: "20%", marginBottom: "6%" }}>
          {coupon.length > 0 ? (
            <table className="table table-light table-striped rounded" style={{ borderCollapse: "collapse" }}>
              <caption style={{ captionSide: "top" }}>COUPON MANAGEMENT</caption>
              <thead className="table-dark py-3">
                <tr className="py-3">
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Min Purchase</th>
                  <th>Max Discount</th>
                  <th>Max Usage</th>
                  <th>Expires At</th>
                  <th>Status</th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {coupon.map((item) => (
                  <tr key={item._id}>
                    <td className="py-4 ps-3" style={{ border: "none" }}>{item.code}</td>
                    <td className="py-3" style={{ border: "none" }}>
                      {item.discount} {item.discountType === "percentage" ? "%" : "₹"}
                    </td>
                    <td className="py-4" style={{ border: "none" }}>₹{item.minPurchase}</td>
                    <td className="py-4" style={{ border: "none" }}>₹{item.maxDiscount}</td>
                    <td className="py-4" style={{ border: "none" }}>{item.maxUsage}</td>
                    <td className="py-4" style={{ border: "none" }}>{new Date(item.expiresAt).toLocaleDateString()}</td>
                    <td className="py-4" style={{ border: "none", color: item.isActive ? "green" : "red" }}>
                      {item.isActive ? "Active" : "Inactive"}
                    </td>
                    <td className="py-3"  style={{ border: "none" }}>
                      <button className="dlt-btn"  style={{backgroundColor: item.isActive ? "brown" :"green" }} onClick={()=>deActivateCoupen(item._id)}>{item.isActive ? "DEACTIVATE" : "ACTIVATE"}</button>
                    </td>
                    <td className="py-3" style={{ border: "none" }}>
                      {item.isActive && (
 <button
    className="btn btn-primary mx-2"
    onClick={() => handleEdit(item._id)}
  >
    Edit
  </button>
)}

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No coupons available</p>
          )}
        </div>

        {isOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>{editCouponData ? "Edit Coupon" : "Create Coupon"}</h2>

              {error && <p style={{ color: "red" }}>{error}</p>}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <label className="form-label">
                  Coupon Code
                  <input
                    type="text"
                    name="code"
                    value={couponData.code}
                    onChange={handleInputChange}
                    placeholder="Enter coupon code"
                    className="form-input"
                    readOnly={!!editCouponData}
                  />
                </label>

                <label className="form-label">
                  Discount Percentage
                  <input
                    type="number"
                    name="discount"
                    value={couponData.discount}
                    onChange={handleInputChange}
                    placeholder="Enter discount"
                    className="form-input"
                  />
                </label>

                <label className="form-label">
                  Minimum Purchase
                  <input
                    type="number"
                    name="minPurchase"
                    value={couponData.minPurchase}
                    onChange={handleInputChange}
                    placeholder="Enter minimum purchase amount"
                    className="form-input"
                  />
                </label>
                <label className="form-label">
               Maximum Discount
  <input
    type="number"
    name="maxDiscount"
    value={couponData.maxDiscount}
    onChange={handleInputChange}
    placeholder="Enter maximum discount"
    className="form-input"
  />
</label>

               

                <label className="form-label">
                  Expiry Date
                  <input
                    type="date"
                    name="expiresAt"
                    value={couponData.expiresAt}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </label>

                <button type="submit" className="btn">
                  {editCouponData ? "Update Coupon" : "Create Coupon"}
                </button>
              </form>

              <button onClick={closeModal} className="btn" style={{marginTop:"2%"}}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Coupon;
