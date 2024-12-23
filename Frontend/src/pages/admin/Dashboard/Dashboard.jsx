import React, { useEffect, useState } from "react";
import { IoMdPricetag } from "react-icons/io";
import { BsFillBarChartFill } from "react-icons/bs";
import { TiShoppingCart } from "react-icons/ti";
import { FaUsers, FaBoxOpen, FaBoxes, FaTags } from "react-icons/fa";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
} from "chart.js";
// import img from "../../assets/images/homepage/check.webp";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { Link } from "react-router-dom";
import { fetchOrder } from "../../../api/admin/OrderMangment";
import { getCategories, getTopCategories} from '../../../api/admin/Category';
import { allProducts, getTopProducts } from "../../../api/admin/Product";
import Navbar from '../../admin/Navbar-Admin/Header'
import { getUsers } from "../../../api/admin/User";
import { salesReport } from "../../../api/admin/salesReport";


ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement
);

const Dashboard = () => {
  const [totalSalesCount, setTotalSalesCount] = useState(0);
  const [overallOrderAmount, setOverallOrderAmount] = useState(0);
  const [overallDiscount, setOverallDiscount] = useState(0);
  const [revenueData, setRevenueData] = useState([]);
  const [category,setCategory]=useState([])
  const [aciveProduct,setActiveProduct]=useState([]);
  const [activeUsers,setActiveUsers]=useState([]);
  const [costData, setCostData] = useState([]);
  const [labels, setLabels] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [timeframe, setTimeframe] = useState("Weekly");
  const [totalProductsSold, setTotalProductsSold] = useState(0);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Fetch data
        const orders = await fetchOrder();
        const categories = await getCategories();
        const topCategoriesData = await getTopCategories();
        const topProductsData = await getTopProducts();
        const product=await allProducts();
        const users=await getUsers();

       
        setCategory(categories);
        setActiveProduct(product)
        setActiveUsers(users)
        
        const fetchOrders=async ()=>{
          try{
           const orders=await fetchOrder();
        
            const totalCount=orders.length;
            const totalAmount=orders.reduce(
             (acc,order)=>acc+order.orderTotal,0
            )

            const totalDiscount=orders.reduce((acc,order)=>acc+order.discountValue,0)
          
 

      
        
            setTotalSalesCount(totalCount)
            setOverallDiscount(totalDiscount)
            // setOverallOrderAmount(totalAmount);
       
          }catch(error){
            console.log(error);
            toast.error("error to fetch data")
            
          }
         }
        
         fetchOrders();
      
     
        setTopProducts(topProductsData);

        const filteredCategories = categories.map(category => {
            const categoryDetails = topCategoriesData.find(c => c._id === category._id);
            
            if (categoryDetails) {
              return {
                name: category.name, 
                totalQuantitySold: categoryDetails.totalQuantitySold
              };
            }
            return null; 
          }).filter(category => category !== null);


          setTopCategories(filteredCategories.sort((a, b) => b.totalQuantitySold - a.totalQuantitySold));

          const totalSold = filteredCategories.reduce(
            (sum, category) => sum + (category.totalQuantitySold || 0),
            0
          );
          setTotalProductsSold(totalSold);

          const date = {
            startDate: null, 
            endDate: null,
            period: timeframe.toLowerCase(),
          };
           
          const { dailyReport, overAllSummery } = await salesReport(date);
          console.log("daily report",dailyReport);
          
       console.log('overAllSummery',overAllSummery);
       setOverallOrderAmount(overAllSummery[0].totalRevanue.toFixed(2))
       
              const chartLabels = dailyReport.map((entry) => entry._id); 
              const chartRevenueData = dailyReport.map((entry) => entry.totalRevanue);
              const chartCostData = dailyReport.map((entry) => entry.netSale);
      
              setLabels(chartLabels);
              setRevenueData(chartRevenueData);
              setCostData(chartCostData);
      
            
              if (overAllSummery.length > 0) {
                setTotalSalesCount(overAllSummery[0].orderCount);
                setOverallDiscount(overAllSummery[0].totalDiscount);
                setOverallOrderAmount(overAllSummery[0].totalRevanue);
              }

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchOrders();
  }, [timeframe]);



  

  const updateTimeframe = (selectedTimeframe) => {
    setTimeframe(selectedTimeframe);

  
    const updatedData = fetchDataForTimeframe(selectedTimeframe);  
    setRevenueData(updatedData.revenue);
    setCostData(updatedData.cost);
    setLabels(updatedData.labels);
  };


  const lineChartData = {
    labels: labels,
    datasets: [
      {
        label: "Revenue",
        data: revenueData,
        borderColor: "rgba(75,192,192,1)",
        borderWidth: 1,
        fill: false,
      },
      {
        label: "Net sales",
        data: costData,
        borderColor: "rgba(255,99,132,1)",
        borderWidth: 1,
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Sales and Cost Over Time",
      },
    },
  };

  return (
   <>
   <Navbar/>
   <div className="container-fluid position-relative" style={{width:"80%",marginLeft:"18%"}}>
      <div className="row">
 
        <div className="col-lg-12">
        <div
  style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    marginTop:"30px"
  }}
>

       <div
            style={{
              backgroundColor: "#FF6F61", 
              color: "white",
              padding: "20px",
              borderRadius: "12px",
              textAlign: "center",
              flex: 1,
              margin: "0 10px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              height: "150px",
            }}
          >
            <FaBoxOpen size={40} style={{ marginBottom: "10px" }} />
            <p style={{ fontSize: "18px", margin: 0 }}>Total Sold Product</p>
            <p style={{ fontSize: "28px", fontWeight: "bold", margin: 0 }}>
              {totalProductsSold}
            </p>
          </div>

  <div
            style={{
              backgroundColor: "#2ECC71",
              color: "white",
              padding: "20px",
              borderRadius: "12px",
              textAlign: "center",
              flex: 1,
              margin: "0 10px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              height: "150px",
            }}
          >
            <FaUsers size={40} style={{ marginBottom: "10px" }} />
            <p style={{ fontSize: "18px", margin: 0 }}>Active Users</p>
            <p style={{ fontSize: "28px", fontWeight: "bold", margin: 0 }}>
              {activeUsers.length}
            </p>
          </div>

          <div
            style={{
              backgroundColor: "#F7CA18",
              color: "white",
              padding: "20px",
              borderRadius: "12px",
              textAlign: "center",
              flex: 1,
              margin: "0 10px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              height: "150px",
            }}
          >
              <FaBoxes size={40} style={{ marginBottom: "10px" }} />
    <p style={{ fontSize: '18px', margin: 0 }}>Active Products</p>
    <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{aciveProduct.length}</p>
  </div>

  <div
            style={{
              backgroundColor: "#3498DB",
              color: "white",
              padding: "20px",
              borderRadius: "12px",
              textAlign: "center",
              flex: 1,
              margin: "0 10px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              height: "150px",
            }}
          >
            <FaTags size={40} style={{ marginBottom: "10px" }} />
    <p style={{ fontSize: '18px', margin: 0 }}>Active Categories</p>
    <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{category.length}</p>
  </div>
</div>

      
         
        </div>
      </div>
   <div className="col-md-8" style={{marginLeft:"24%"}}>
   <div className="mt-4 mb-4">
   {/* className="card-body position-relative" */}
   <div style={{width:"100%",height:"50%" , marginLeft:"-15%"}}>  
              <Line data={lineChartData} options={chartOptions} />

              <div className="position-absolute top-0 end-0 ms-5" >
                <div className="dropdown">
                  <button
                    className="btn btn-light dropdown-toggle"
                    // style={{marginLeft:"30%"}}
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {timeframe}
                  </button>
                  <ul className="dropdown-menu">
                    <li>
                      <button className="dropdown-item" onClick={() => updateTimeframe("Weekly")}>
                        Weekly
                      </button>
                    </li>
                    <li>
                      <button className="dropdown-item" onClick={() => updateTimeframe("Monthly")}>
                        Monthly
                      </button>
                    </li>
                    {/* <li>
                      <button className="dropdown-item" onClick={() => updateTimeframe("Yearly")}>
                        Yearly
                      </button>
                    </li> */}
                  </ul>
                </div>
              </div>
            </div>
          </div>
   </div>
     
    


</div>
<div>
<div className="col-md-8 mb-5"  style={{marginLeft:"24%"}}>
    <h5 className="card-title">Top Selling Products</h5>
    <div className="offers-table">
      {topProducts.length > 0 ? (
        <table className="table table-light table-striped rounded" style={{ borderCollapse: 'collapse' }}>
          <caption style={{ captionSide: 'top' }}>Top Selling Products</caption>
          <thead className="table-dark py-3">
            <tr className="py-3">
              <th>Product Name</th>
              <th>Image</th>
              <th>Total Sold</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.map((product) => (
              <tr key={product._id}>
                <td className="py-4 ps-3">{product?.name || "No product found"}</td>
                <td className="py-3">
                  <img
                    src={`http://localhost:3009/${product?.images}` || "https://via.placeholder.com/150"}
                    alt={product.name}
                    className="img-fluid rounded"
                    style={{ width: "50px", height: "50px" }}
                  />
                </td>
                <td className="py-3">{product.totalQuantitySold || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No products available</p>
      )}
    </div>
  </div>


<div className="col-md-8 mb-5"  style={{marginLeft:"24%"}}>
    <h5 className="card-title">Top Selling Categories</h5>
    <div className="offers-table">
      {topCategories.length > 0 ? (
        <table className="table table-light table-striped rounded" style={{ borderCollapse: 'collapse' }}>
          <caption style={{ captionSide: 'top' }}>Top Selling Categories</caption>
          <thead className="table-dark py-3">
            <tr className="py-3">
              <th>Category Name</th>
             
              <th>Total Sold</th>
            </tr>
          </thead>
          <tbody>
            {topCategories.map((category) => (
              <tr key={category.id}>
                <td className="py-4 ps-3">{category.name || "No Category"}</td>
                <td className="py-3">{category.totalQuantitySold}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No categories available</p>
      )}
    </div>
  </div>



    </div>
   </>
  );
};

export default Dashboard;
