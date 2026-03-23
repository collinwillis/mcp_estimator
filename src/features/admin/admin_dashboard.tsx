import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  updateDoc,
} from 'firebase/firestore';

import { UserPermission, UserProfile, UserRole } from '../../models/user';

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    'borderRadius': 1,
    'fontSize': '0.875rem',
    'backgroundColor': '#f9fafb',
    '& fieldset': { borderColor: '#e5e7eb' },
    '&:hover fieldset': { borderColor: '#d1d5db' },
    '&.Mui-focused fieldset': { borderColor: '#9ca3af', borderWidth: 1 },
  },
  '& .MuiInputLabel-root': { fontSize: '0.875rem', color: '#6b7280' },
};

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const db = getFirestore();
  const navigate = useNavigate();

  useEffect(() => {
    const getUsers = async () => {
      const usersCol = collection(db, 'users');
      const userSnapshot = await getDocs(usersCol);
      const userList: UserProfile[] = [];
      userSnapshot.forEach((doc) => {
        const userData = doc.data() as UserProfile;
        userList.push({ ...userData, uid: doc.id });
      });
      setUsers(userList.filter((user) => !user.deleted));
    };
    getUsers();
  }, [db]);

  const updateUser = async (userId: string, data: Partial<UserProfile>) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, data);
    setUsers((prev) =>
      prev.map((user) => (user.uid === userId ? { ...user, ...data } : user)),
    );
  };

  const btnSx = {
    'textTransform': 'none' as const,
    'fontWeight': 500,
    'fontSize': '0.8rem',
    'borderRadius': 1,
    'px': 1.5,
    'py': 0.35,
    'minWidth': 0,
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          height: 48,
          px: 2,
          borderBottom: '1px solid #e5e7eb',
          flexShrink: 0,
          backgroundColor: '#1f2937',
        }}>
        <IconButton size='small' onClick={() => navigate(-1)} sx={{ color: '#9ca3af', mr: 1.5 }}>
          <ArrowBack sx={{ fontSize: 18 }} />
        </IconButton>
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#f3f4f6' }}>
          Admin Console
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', px: { xs: 2, sm: 3, md: 4 }, py: 3, maxWidth: 1200, mx: 'auto', width: '100%' }}>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 2 }}>
          User Management
        </Typography>

        {/* Search */}
        <TextField
          fullWidth
          variant='outlined'
          size='small'
          placeholder='Search users...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <Search sx={{ fontSize: 16, color: '#9ca3af' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            'mb': 2,
            'maxWidth': 360,
            '& .MuiOutlinedInput-root': {
              'height': 34,
              'borderRadius': 1,
              'backgroundColor': '#f3f4f6',
              'fontSize': '0.875rem',
              '& fieldset': { borderColor: 'transparent' },
              '&:hover fieldset': { borderColor: '#d1d5db' },
              '&.Mui-focused fieldset': { borderColor: '#9ca3af', borderWidth: 1 },
            },
          }}
        />

        {/* Table */}
        <TableContainer sx={{ border: '1px solid #e5e7eb', borderRadius: 1.5, overflow: 'hidden' }}>
          <Table size='small'>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                {['Name', 'Email', 'Permission', 'Role', 'Actions'].map((h) => (
                  <TableCell key={h} sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e5e7eb', py: 1 }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {users
                .filter((user) => user.name.toLowerCase().includes(search.toLowerCase()) && !user.deleted)
                .map((user) => (
                  <TableRow key={user.uid} sx={{ '&:hover': { backgroundColor: '#f9fafb' } }}>
                    <TableCell sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#111827', py: 1, borderBottom: '1px solid #f3f4f6' }}>
                      {user.name}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem', color: '#6b7280', py: 1, borderBottom: '1px solid #f3f4f6' }}>
                      {user.email}
                    </TableCell>
                    <TableCell sx={{ py: 1, borderBottom: '1px solid #f3f4f6' }}>
                      <FormControl variant='outlined' size='small' fullWidth sx={fieldSx}>
                        <Select
                          value={user.permission}
                          onChange={(e) => updateUser(user.uid, { permission: e.target.value as UserPermission })}
                          sx={{ fontSize: '0.85rem' }}>
                          <MenuItem value={UserPermission.READ} sx={{ fontSize: '0.85rem' }}>Read</MenuItem>
                          <MenuItem value={UserPermission.READ_WRITE} sx={{ fontSize: '0.85rem' }}>Read & Write</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell sx={{ py: 1, borderBottom: '1px solid #f3f4f6' }}>
                      <FormControl variant='outlined' size='small' fullWidth sx={fieldSx}>
                        <Select
                          value={user.role}
                          onChange={(e) => updateUser(user.uid, { role: e.target.value as UserRole })}
                          sx={{ fontSize: '0.85rem' }}>
                          <MenuItem value={UserRole.USER} sx={{ fontSize: '0.85rem' }}>User</MenuItem>
                          <MenuItem value={UserRole.ADMIN} sx={{ fontSize: '0.85rem' }}>Admin</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell sx={{ py: 1, borderBottom: '1px solid #f3f4f6' }}>
                      <Box sx={{ display: 'flex', gap: 0.75 }}>
                        <Tooltip title={user.disabled ? 'Re-enable this user' : 'Disable this user'} enterDelay={400}>
                          <Button
                            onClick={() => updateUser(user.uid, { disabled: !user.disabled })}
                            sx={{
                              ...btnSx,
                              'border': '1px solid',
                              'borderColor': user.disabled ? '#fbbf24' : '#e5e7eb',
                              'color': user.disabled ? '#92400e' : '#6b7280',
                              'backgroundColor': user.disabled ? '#fffbeb' : 'transparent',
                              '&:hover': {
                                backgroundColor: user.disabled ? '#fef3c7' : '#f3f4f6',
                              },
                            }}>
                            {user.disabled ? 'Enable' : 'Disable'}
                          </Button>
                        </Tooltip>
                        <Tooltip title='Permanently delete this user' enterDelay={400}>
                          <Button
                            onClick={() => updateUser(user.uid, { deleted: true })}
                            sx={{
                              ...btnSx,
                              'border': '1px solid #fecaca',
                              'color': '#dc2626',
                              '&:hover': { backgroundColor: '#fef2f2', borderColor: '#f87171' },
                            }}>
                            Delete
                          </Button>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
