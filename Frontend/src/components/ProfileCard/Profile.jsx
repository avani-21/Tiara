import React, { useState, useEffect } from "react";
import "./Profile.css";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { toast } from "react-toastify";
import axios from "axios";
import { useParams } from "react-router-dom";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const ProfileCard = ({ profileData }) => {
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openPasswordModal, setOpenPasswordModal] = useState(false);

  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [conformPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  const handleEditOpen = () => setOpenEditModal(true);
  const handleEditClose = () => setOpenEditModal(false);
  const handlePasswordOpen = () => setOpenPasswordModal(true);
  const handlePasswordClose = () => setOpenPasswordModal(false);

  // Initialize fields when edit modal opens
  useEffect(() => {
    if (openEditModal) {
      setUserName(profileData.username);
      setEmail(profileData.email);
    }
  }, [openEditModal, profileData]);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("userToken");
      const response = await axios.put(
        `/api/user/profile/${profileData._id}`,
        {
          username,
          email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setOpenEditModal(false);
        toast.success("Profile updated successfully");
        profileData.username = username;
        profileData.email = email;
      }
    } catch (error) {
      toast.error("Failed to update the user profile");
    } finally {
      setLoading(false);
    }
  };



  const handleChangePassword = async () => {
    if (newPassword !== conformPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }
    if(!newPassword.trim() || !conformPassword.trim()){
      toast.error("Fields are required")
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("userToken");
      const response = await axios.patch(
        `/api/user/profile/${id}`,
        { newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setOpenPasswordModal(false);
        toast.success("Password changed successfully");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };
  console.log('sdfghjk',profileData);
  

  return (
    <div className="card" >
      <img
       style={{width:"120px",height:"120px"}}
        src={`${profileData.image}`}
        alt={profileData.username}
      />
      <div className="details">
        <h2>{profileData.username}</h2>
      </div>
      <p id="info">Email: {profileData.email}</p>
      <p id="info">Registered At: {profileData.createdAt}</p>
     <p id="info">Refferal Code:{profileData?.referalCode}</p>
      <div className="btns-group">
        <button className="edit-btn" onClick={handleEditOpen}>
          Edit Profile
        </button>
        <button className="password" onClick={handlePasswordOpen}>
          Change Password
        </button>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        open={openEditModal}
        onClose={handleEditClose}
        aria-labelledby="edit-modal-title"
        aria-describedby="edit-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="edit-modal-title" variant="h6" component="h2">
            Update Profile
          </Typography>

          <TextField
            fullWidth
            margin="normal"
            label="Username"
            variant="outlined"
            value={username}
            onChange={(e) => setUserName(e.target.value)}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            variant="outlined"
            value={email}
            disabled
            onChange={(e) => setEmail(e.target.value)}
          />

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpdate}
              disabled={loading}
            >
              {loading ? "Updating..." : "Update"}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleEditClose}
            >
              Close
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        open={openPasswordModal}
        onClose={handlePasswordClose}
        aria-labelledby="password-modal-title"
        aria-describedby="password-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="password-modal-title" variant="h6" component="h2">
            Change Password
          </Typography>

          <TextField
            fullWidth
            margin="normal"
            label="New Password"
            type="password"
            variant="outlined"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Confirm Password"
            type="password"
            variant="outlined"
            value={conformPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleChangePassword}
              disabled={loading}
            >
              {loading ? "Loading ..." : "Change Password"}
            </Button>

            <Button
              variant="outlined"
              color="secondary"
              onClick={handleChangePassword}
            >
              Close
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default ProfileCard;
