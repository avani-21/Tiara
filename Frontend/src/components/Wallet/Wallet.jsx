import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addMoney, getWallet } from "../../api/user/Wallet";
import Loader from "../Loader/Loader";
import { toast } from "react-toastify";
import "./Wallet.css"; // Add custom styles
import NavBar from "../Header/Navbar";
import Sidebar from "../ProfileCard/Sidebar";
import Footer from "../Footer/Footer";
import { updateWallet } from "../../api/user/Wallet";

const Wallet = () => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [amount, setAmount] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("userToken");

    if (!token) {
      navigate("/login");
      return;
    }
    fetchWallet();
  }, [navigate]);

  const fetchWallet = async () => {
    try {
      const data = await getWallet();
      setWallet(data.wallet);
      setLoading(false);
    } catch (error) {
      setError("Failed to fetch wallet data");
      setLoading(false);
    }
  };

  const handleAddMoney = async () => {
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    try {
      const response = await addMoney(numericAmount, navigate);
   console.log("fkfjijfijds",response)

      if(response.message==='Success'){
        console.log('hi')
        const { orderId, amount } = response;   
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: response.amount * 100,
          currency: "INR",
          name: "Tiara",
          description: "Add money to wallet",
          order_id: response.orderId,
          handler: async function () {
            try{
              console.log('wertyu')
              const walletUpdate=await updateWallet(numericAmount)
              if(walletUpdate){
                toast.success("Money added to wallet successfully!");
                fetchWallet();
                closeModal(); 
              }

            }catch(error){
              toast.error(error?.response?.data?.message || "Error updating wallet")
            }

          },

          theme: {
            color: "#3399cc",
          }
        };
          
          const razorpay = new window.Razorpay(options);
          razorpay.open();
        
       }

    
    } catch (error) {
      console.error("Error adding money:", error);
      toast.error("Failed to add money");
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setAmount("");
  };
  return (
    <>
      <NavBar />
      <Sidebar />
      <div className="wallet">
        <h2>Your Wallet</h2>
        {loading ? (
          <Loader />
        ) : (
          <>
            <p>Balance: {wallet?.balance || 0}</p>
            <button onClick={openModal} className="open-modal-button">
              Add Money
            </button>
          </>
        )}
        {error && <p>{error}</p>}
  
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Add Money</h3>
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!isNaN(value) && Number(value) >= 0) {
                    setAmount(value);
                  }
                }}
                placeholder="Enter amount"
              />
              <div className="modal-actions">
                <button onClick={handleAddMoney} className="add-money-button">
                  Add
                </button>
                <button onClick={closeModal} className="cancel-button">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  
      {/* Transaction History Table - Outside of Wallet Class */}
      <div
        className="transactions-table"
        style={{ width: "70%",marginBottom:"10%" }}
      >
        {wallet?.transactions?.length > 0 ? (
          <table
            className="table table-light table-striped rounded"
            style={{ borderCollapse: "collapse",marginLeft:"30%" }}
          >
            <caption style={{ captionSide: "top" }}>TRANSACTION HISTORY</caption>
            <thead className="table-dark py-3">
              <tr className="py-3">
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {wallet.transactions.map((transaction, index) => (
                <tr key={index}>
                  <td className="py-4" style={{ border: "none" }}>
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td
                    className="py-4"
                    style={{
                      border: "none",
                      color: transaction.type === "credit" ? "green" : "red",
                    }}
                  >
                    {transaction.type.toUpperCase()}
                  </td>
                  <td className="py-4" style={{ border: "none" }}>
                    ₹{Math.round(transaction.amount)}
                  </td>
                  <td className="py-4" style={{ border: "none" }}>
                    {transaction.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
     <>
     <div  style={{ width: "70%",marginBottom:"10%" }}>
           
     <table
            className="table table-light table-striped rounded"
            style={{ borderCollapse: "collapse" ,marginLeft:"40%" }}
          >
            <caption style={{ captionSide: "top" }}>TRANSACTION HISTORY</caption>
            <thead className="table-dark py-3">
              <tr className="py-3">
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="4" className="text-center">
                  No Transactions Available
                </td>
              </tr>
            </tbody>
          </table>
     </div>
     </>
        )}
      </div>
    </>
  );
  
};

export default Wallet;
