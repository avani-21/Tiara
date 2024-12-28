import axiosInstance from '../../../api/axiosInstance';
import React,{useState,useEffect} from 'react'
import ProfileCard from '../../../components/ProfileCard/Profile';
import Loader from '../../../components/Loader/Loader';
import { useParams } from 'react-router-dom';
import NavBar from '../../../components/Header/Navbar';
import  Drawer  from '../../../components/ProfileCard/Sidebar'

function Profile() {
  const [profileData,setProfileData]=useState([])
  const {id}=useParams()

  console.log('ertyu',id);
  

  useEffect(()=>{
      const userProfile=async ()=>{
        const token=localStorage.getItem('userToken');
        const response=await axiosInstance.get(`/api/user/profile/${id}`,{
            headers:{
                Authorization:`Bearer ${token}`
            }
        }) 
        console.log('res',response); 
        if(response.status===200){
           setProfileData(response.data.user)
        }
      }
   userProfile();
  },[])
   console.log(profileData);
   
  return (
    <div style={{width: '100vw'}}>
        <NavBar/>
        <Drawer profileData={profileData}/>
        {profileData ? 
             ( <ProfileCard  profileData={profileData}/>):
              ( <Loader/> )
            }

    </div>
  )
}

export default Profile
