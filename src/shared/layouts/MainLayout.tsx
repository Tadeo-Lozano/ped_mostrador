import AddTaskOutlinedIcon from '@mui/icons-material/AddTaskOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type { ReactElement } from 'react';
import { useState } from 'react';
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom';

import { routeItems } from '@/config/routes';
import type { AppRoutePath } from '@/config/routes';
import { useAuth } from '@/modules/auth/hooks/useAuth';

const drawerWidth = 264;

const iconsByPath: Record<AppRoutePath, ReactElement> = {
  '/solicitudes/nueva': <AddTaskOutlinedIcon />,
  '/solicitudes/mias': <AssignmentTurnedInOutlinedIcon />,
  '/solicitudes/pendientes': <InboxOutlinedIcon />,
  '/historial': <HistoryOutlinedIcon />,
  '/supervisor': <DashboardOutlinedIcon />,
};

export function MainLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { profile, signOut } = useAuth();
  const location = useLocation();

  const visibleRoutes = routeItems.filter(
    (item) => profile && item.roles.includes(profile.role),
  );

  const drawer = (
    <Stack sx={{ height: '100%' }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 2 }}>
        <Inventory2OutlinedIcon color="primary" />
        <Box>
          <Typography fontWeight={800}>Refaccionaria</Typography>
          <Typography variant="body2" color="text.secondary">
            Almacenes
          </Typography>
        </Box>
      </Stack>

      <Divider />

      <List sx={{ flex: 1, px: 1, py: 1.5 }}>
        {visibleRoutes.map((item) => (
          <ListItemButton
            key={item.path}
            component={RouterLink}
            to={item.path}
            selected={location.pathname === item.path}
            onClick={() => setIsMobileOpen(false)}
            sx={{ borderRadius: 1 }}
          >
            <ListItemIcon>{iconsByPath[item.path]}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>

      <Divider />

      <Stack spacing={1.5} sx={{ p: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ width: 36, height: 36 }}>
            {profile?.full_name.slice(0, 1).toUpperCase() ?? 'U'}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap fontWeight={700}>
              {profile?.full_name ?? 'Usuario'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {profile?.role ?? 'sin rol'}
            </Typography>
          </Box>
        </Stack>

        <ListItemButton onClick={() => void signOut()} sx={{ borderRadius: 1 }}>
          <ListItemIcon>
            <LogoutOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary="Salir" />
        </ListItemButton>
      </Stack>
    </Stack>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: { sm: 'none' },
        }}
      >
        <Toolbar>
          <Tooltip title="Abrir navegacion">
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setIsMobileOpen(true)}
              aria-label="Abrir navegacion"
            >
              <MenuOutlinedIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h6" sx={{ ml: 1 }}>
            Refaccionaria
          </Typography>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={isMobileOpen}
          onClose={() => setIsMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRightColor: 'divider',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          px: { xs: 2, md: 4 },
          py: { xs: 10, sm: 4 },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
