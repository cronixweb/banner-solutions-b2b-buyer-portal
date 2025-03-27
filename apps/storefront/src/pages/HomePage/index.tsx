import B3Layout from "@/components/layout/B3Layout";
import Order from "../order/Order";
import ShoppingLists from "../ShoppingLists";
import Invoice from "../Invoice";
import { Box } from "@mui/system";
import { useNavigate } from "react-router-dom";

function HomePage() {

  const navigate = useNavigate();
  
  return (
  <B3Layout isDashboard={true}>
    
    <Box
    sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        mb: '20px',
      }}>
        <h4>All Orders</h4>
        <a href="#/allOrders" onClick={(e) => { e.preventDefault(); navigate('/allOrders'); }}>View All</a>
    </Box>
    <Order />
    
    <Box
    sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        mb: '20px',
      }}>
        <h4>All Invoices</h4>
        <a href="#/invoice" onClick={(e) => { e.preventDefault(); navigate('/invoice'); }}>View All</a>
    </Box>
    <Invoice />
    
    <Box
    sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        mb: '20px',
      }}>
        <h4>All Projects</h4>
        <a href="#/shoppingLists" onClick={(e) => { e.preventDefault(); navigate('/shoppingLists'); }}>View All</a>
    </Box>
    <ShoppingLists />

   </B3Layout>);
}

export default HomePage;
