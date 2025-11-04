import { Menu } from "@mui/icons-material";
import { AppBar, Box, Button, IconButton, Toolbar, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { logout } from "../../auth/authService";

export default function TopAppBar({
  isLoggedIn,
}: {
  isLoggedIn: boolean,
}) {
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/');
    window.location.reload()
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <Menu />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            IMP Tools
          </Typography>
          { isLoggedIn ? null : <Button color="inherit" onClick={() => navigate('/login')}>Login</Button> }
          { isLoggedIn ? null : <Button color="inherit" onClick={() => navigate('/register')}>Register</Button> }
          { !isLoggedIn ? null : <Button color="inherit" onClick={onLogout}>Logout</Button> }
        </Toolbar>
      </AppBar>
    </Box>
  );
}