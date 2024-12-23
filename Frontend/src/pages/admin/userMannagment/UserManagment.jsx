import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './UserManagment.css';
import Navbar from '../../admin/Navbar-Admin/Header'

const TableComponent = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('adminToken');

        
        const response = await axios.get('/api/admin/users', {
          headers: {
             Authorization: `Bearer ${token}`
          }
        });
        if (response.status === 200) {
          setUsers(response.data.users)
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchUser();
  }, []);

  const handleBlock=async (userId)=>{
    try{
      const token=localStorage.getItem('adminToken')
 
      
      const user=users.find(user=>user._id===userId)
      if(user.isBlocked){
        const response=await axios.patch(`/api/admin/users/${userId}/unblock`,{},{
          headers:{
            Authorization:`Bearer ${token}`
          }
        })
        if(response.status===200){
          console.log('user unblocked')
          setUsers((prevUsers) =>
            prevUsers.map((u) =>
              u._id === userId ? { ...u, isBlocked: false } : u
            )
          );
        }
      }else{
        const result=await axios.patch(`/api/admin/users/${userId}/block`,{},{
          headers:{
            Authorization:`Bearer ${token}`
          }
        })
        if(result.status===200){
          console.log('user blocked')
          setUsers((prevUsers) =>
            prevUsers.map((u) =>
              u._id === userId ? { ...u, isBlocked: true } : u
            )
          );

          if(userId === localStorage.getItem('userId')){
            localStorage.removeItem('userToken')
          }

        }
      }

    }catch(error){
      console.log(error.response?.data?.message || 'failed');
      
    }
  }

  return (
    <>
    <Navbar/>
      <div className="table-container">
         <h2>USER MANAGEMENT</h2>
        <div className="table-header">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="add-btn">Add</button>
        </div>
        <table className="content-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>USERNAME</th>
              <th>EMAIL</th>
              <th>STATUS</th>
              <th>BLOCK</th>
            </tr>
          </thead>
          <tbody>
            {users
              .filter(item => item.username.toLowerCase().includes(searchQuery.toLowerCase().trim()))
              .map(item => (
                <tr key={item._id}>
                  <td>{item._id}</td>
                  <td>{item.username}</td>
                  <td>{item.email}</td>
                  <td style={{ color: item.isBlocked ? 'red' : 'green' }}>
                    {item.isBlocked ? 'Blocked' : 'Active'}
                  </td>
                  <td>
                    <button onClick={()=>handleBlock(item._id)}>{item.isBlocked ? 'UNBLOCK' : 'BLOCK'}</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default TableComponent;
