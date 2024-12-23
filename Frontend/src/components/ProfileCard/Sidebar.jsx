import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import { useNavigate } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LockIcon from '@mui/icons-material/Lock';
import HomeIcon from '@mui/icons-material/Home';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LogoutIcon from '@mui/icons-material/Logout';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';


const drawerWidth = 240;

function LeftDrawer(props) {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [userId,setUserId]=React.useState('')
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  React.useEffect(()=>{
    const id=localStorage.getItem('userId')
    setUserId(id)
  },[])

  const handleNavigation = (text) => {
    let path = '';
    switch (text) {
      case 'Profile':
        path = `/pro/${userId}`;
        break;
        case 'Address': 
        path = '/address';
        break;
      case 'Order':
        path = '/order-details';
        break;
      case 'Cart':
        path = '/cart';
        break;
      
        case 'Wishlist':
          path='/wishlist'
          break;
        case 'Wallet':
          path='/wallet'
          break;
          case 'Logout':
            localStorage.removeItem('userId')
            localStorage.removeItem("userToken");
        path = '/';
        break;
      default:
        path = '/';
    }
    navigate(path);
  };

 

  const menuItems = [
    { text: 'Profile', icon: <AccountCircleIcon /> },                // Profile icon
    { text: 'Address', icon: <HomeIcon /> },                         // Address icon
    { text: 'Order', icon: <LocalShippingIcon /> },                  // Orders icon (Shipping)
    { text: 'Cart', icon: <ShoppingCartIcon /> },                    // Shopping Cart icon
    { text: 'Wishlist', icon: <FavoriteIcon /> },                    // Wishlist icon
    { text: 'Wallet', icon: <AccountBalanceWalletIcon /> },          // Wallet icon
    { text: 'Logout', icon: <LogoutIcon /> },                        // Logout icon
  ];
  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List sx={{ padding: 1 }}>
        {menuItems.map(({ text, icon }, index) => (
          <ListItem key={text} disablePadding sx={{ marginBottom: 2 }}>
            <ListItemButton onClick={() => handleNavigation(text)}>
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
    </div>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 }, mt: 8 }}
        aria-label="mailbox folders"
      >
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth ,height:"min-content",  marginTop: '85px',  overflow: 'hidden', zIndex:"0" ,  overflowY: 'auto', 
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth ,height:"min-content",  marginTop: '85px' ,  overflow: 'hidden' ,zIndex:"0", marginBottom:"100px" ,overflowY: 'auto', 
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
    </Box>
  );
}

LeftDrawer.propTypes = {
  window: PropTypes.func,
};

export default LeftDrawer;
