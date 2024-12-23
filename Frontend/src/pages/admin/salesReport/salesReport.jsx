import jspdf from 'jspdf'
import "jspdf-autotable"
import * as XLSX from 'xlsx'
import React, { useState,useEffect } from 'react'
import Navbar from '../Navbar-Admin/Header'
import {fetchOrder, fetchOrderData} from '../../../api/admin/OrderMangment'
import { salesReport } from '../../../api/admin/salesReport'
import { toast } from 'react-toastify'

function salesReports() {
  const [orders,setOrders]=useState([])
  const [selectedFilter, setSelectedFilter] = useState("Sort");
  const [totalSalesCount, setTotalSalesCount] = useState(0);
  const [overallOrderAmount, setOverallOrderAmount] = useState(0);
  const [overallDiscount, setOverallDiscount] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reports, setReports] = useState([]);
  const [revanueSumTotal,setRevanueSumTotal]=useState()

  useEffect(()=>{
    fetchOrders()
  },[])

  const fetchOrders=async ()=>{
   try{
    const order=await fetchOrder();
     console.log(order);
     setOrders(order)
     const totalCount=order.length;
     const totalAmount=order.reduce(
      (acc,order)=>acc+order.orderTotal,0
     )
     const totalDiscount=order.reduce((acc,order)=>acc+order.discountValue,0)
     
     
    
     setTotalSalesCount(totalCount.toFixed(2))
     setOverallDiscount(totalDiscount.toFixed(2))
     setOverallOrderAmount(totalAmount.toFixed(2));

   }catch(error){
     console.log(error);
     toast.error("error to fetch data")
     
   }
  }

  const filters=["daily","weekly","monthly"];


  const handleFilterSelect = async (filter) => {
    setSelectedFilter(filter);
  
    const dateRange = { period: filter };
    try {
      
      const allReport = await salesReport(dateRange); 
      setReports(allReport);

      const revanueSum=allReport.dailyReport?.reduce(
        (sum,report)=>sum +(report.totalRevanue),0
      )
      console.log("sum revanue",revanueSum);
      
      setRevanueSumTotal(revanueSum.toFixed(2));
    } catch (error) {
     
      console.error("Error fetching report:", error);
    }
  };

  const handleStartDateChange = (e) => setStartDate(e.target.value);
  const handleEndDateChange = (e) => setEndDate(e.target.value);
  
  const handleDateSubmit=async (e)=>{
    e.preventDefault();

    if(!startDate || !endDate){
      toast("Please select both start and end dates")
    }
    const date={
      startDate,
      endDate
    }
    try{
       const allReport=await salesReport(date)
       console.log('dshsdhdhfjdhb',allReport);
       
       setReports(allReport)
    }catch(error){
     console.log("Error fetching data:",error)
    }
  }

  const downloadPdfReport = () => {
    const doc = new jspdf();

    doc.setFont("Helvetica", "bold");
    doc.setTextColor(0);

    doc.setFontSize(16);
    doc.text("TIARA", doc.internal.pageSize.getWidth() / 2, 10, { align: "center" });

    doc.setFontSize(20);
    doc.text("Sales Report", doc.internal.pageSize.getWidth() / 2, 20, {
      align: "center",
    });

  

    doc.setFontSize(12);
    doc.setFont("Helvetica", "normal");
    const summaryData = [
      `Total Sales Count: ${reports?.overAllSummery?.[0]?.orderCount} Orders`,
      `Overall Order Amount: ${reports?.overAllSummery?.[0]?.totalRevanue.toFixed(2)}`,
      `Overall Discount: ${reports?.overAllSummery?.[0]?.totalDiscount.toFixed(2)}`,
    ];

    summaryData.forEach((text, index) => {
      doc.text(text, 14, 30 + index * 6);
    });

    // Prepare table data
    const tableColumn = [
      "Date",
      "Total Sales Revenue",
      "Discount Applied",
      "Net Sales",
      "Number of Orders",
    ];
    const tableRows = [];

    if (reports.dailyReport && reports.dailyReport.length > 0) {
      reports.dailyReport
        .slice()
        .reverse()
        .forEach((report) => {
          const reportData = [
            new Date(report._id).toLocaleDateString("en-GB"),
            `${report.totalRevanue.toFixed(2)}`,
            `${report.totalDiscount.toFixed(2)}`,
            `${report.netSale.toFixed(2)}`,
            report.orderCount.toString(),
          ];
          tableRows.push(reportData);
        });
    }

    doc.autoTable({
      startY: 50,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
      bodyStyles: { textColor: [0, 0, 0] },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      columnStyles: {
        0: { halign: "center" },
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "center" },
        5: { halign: "center" },
      },
    });

    
    doc.save("Sales_Report.pdf");
  };

  const downloadExcelReport = () => {
    const worksheetData = [
      [
        "Date",
        "Total Sales Revenue",
        "Discount Applied",
        "Net Sales",
        "Number of Orders",
      
      ],
      ...(reports.dailyReport && reports.dailyReport.length > 0
        ? reports.dailyReport
            .slice()
            .reverse()
            .map((report) => [
              new Date(report._id).toLocaleDateString("en-GB"),
              `₹${report.totalRevanue.toFixed(2)}`, 
              `₹${report.totalDiscount.toFixed(2)}`, 
              `₹${report.netSale.toFixed(2)}`, 
              report.orderCount.toString(),
           
            ])
        : []),
    ];
  
  
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
    
    const columnWidths = [
      { wch: 12 },
      { wch: 20 }, 
      { wch: 20 }, 
      { wch: 15 }, 
      { wch: 18 }, 
    
    ];
    worksheet['!cols'] = columnWidths;
  
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");
  

    XLSX.writeFile(workbook, "Sales_Report.xlsx");
  };

const today=new Date().toISOString().split('T')[0];

  
  return (
    <>
      <Navbar />
      <div style={{ width: '75%', margin: '20px auto', marginBottom: '6%', marginLeft:"20%" }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
        
          <div
            style={{
              backgroundColor: 'black', 
              color: 'white',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center',
              flex: 1,
              margin: '0 10px',
            }}
          >
            <p style={{ fontSize: '18px', margin: 0 }}>Order Count</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
              {reports?.overAllSummery?.[0]?.orderCount}
            </p>
          </div>
          <div
            style={{
              backgroundColor: 'black', 
              color: 'white',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center',
              flex: 1,
              margin: '0 10px',
            }}
          >
            <p style={{ fontSize: '18px', margin: 0 }}>Total Revanue</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
              {reports?.overAllSummery?.[0]?.totalRevanue.toFixed(2)}
            </p>
          </div>
          <div
            style={{
              backgroundColor: 'black', 
              color: 'white',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center',
              flex: 1,
              margin: '0 10px',
            }}
          >
            <p style={{ fontSize: '18px', margin: 0 }}>Total Discount</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
              {reports?.overAllSummery?.[0]?.totalDiscount.toFixed(2)}
            </p>
          </div>
  

        </div>
  
    
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <div>
            <label htmlFor="start-date" style={{ marginRight: '10px' }}>
              Start Date:
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={startDate}
              onChange={handleStartDateChange}
              style={{ marginRight: '20px' }}
              max={today}
            />
  
            <label htmlFor="end-date" style={{ marginRight: '10px' }}>
              End Date:
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={endDate}
              onChange={handleEndDateChange}
              max={today}
            />
  
            <button type="submit" className="btn" onClick={handleDateSubmit}>
              Apply Date Range
            </button>
          </div>
  
          <div>
            <div className="relative">
              <select
                id="filter-select"
                className="form-select block w-48 bg-white text-sm text-gray-700 rounded-lg shadow-sm focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:focus:ring-blue-500"
                value={selectedFilter}
                onChange={(e) => handleFilterSelect(e.target.value)}
              >
                {filters.map((filter) => (
                  <option key={filter} value={filter}>
                    {filter}
                  </option>
                ))}
              </select>
            </div>
  
            <button
              className="btn btn-primary"
              onClick={downloadPdfReport}
              style={{ marginRight: '10px' }}
            >
              Download as PDF
            </button>
            <button className="btn btn-success" onClick={downloadExcelReport}>
              Download as Excel
            </button>
          </div>
        </div>
  
        <table
          className="table table-light table-striped rounded"
          style={{ borderCollapse: 'collapse' }}
        >
          <caption style={{ captionSide: 'top' }}>SALES REPORT</caption>
          <thead className="table-dark">
            <tr>
              <th>Order Date</th>
              <th>Total Amount</th>
              <th>Sales</th>
              <th>Discounted Value</th>
            </tr>
          </thead>
          <tbody>
            {reports?.dailyReport && reports?.dailyReport.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-gray-500">
                  No reports available.
                </td>
              </tr>
            ) : (
              reports?.dailyReport &&
              reports?.dailyReport
                .slice()
                .reverse()
                .map((report) => (
                  <tr key={report._id}>
                    <td>{report._id}</td>
                    <td>₹{report.totalRevanue.toFixed(2)}</td>
                    <td>₹{report.netSale.toFixed(2)}</td>
                    <td>₹{report.totalDiscount.toFixed(2)}</td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
  
}

export default salesReports
