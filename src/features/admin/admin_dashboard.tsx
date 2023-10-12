import React, {useEffect, useState} from 'react';
import {
    AppBar,
    Box,
    Button,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import {collection, doc, getDocs, getFirestore, updateDoc} from 'firebase/firestore';
import {UserPermission, UserProfile, UserRole} from '../../models/user';
import {ArrowBack} from "@mui/icons-material";
import {useNavigate} from "react-router-dom";
import Toolbar from "@mui/material/Toolbar";

const AdminDashboard: React.FC = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [search, setSearch] = useState('');
    const db = getFirestore();

    useEffect(() => {
        const getUsers = async () => {
            const usersCol = collection(db, 'users');
            const userSnapshot = await getDocs(usersCol);
            const userList: UserProfile[] = [];
            userSnapshot.forEach(doc => {
                const userData = doc.data() as UserProfile;
                userList.push({...userData, uid: doc.id});
            });
            setUsers(userList.filter(user => !user.deleted));
        };

        getUsers();
    }, [db]);

    const updateUser = async (userId: string, data: Partial<UserProfile>) => {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, data);
        setUsers(prev =>
            prev.map(user =>
                user.uid === userId ? {...user, ...data} : user
            )
        );
    };
    const navigate = useNavigate();
    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <Box display="flex" flexGrow={1}>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={() => navigate(-1)}
                            aria-label="back"
                        >
                            <ArrowBack/>
                        </IconButton>
                    </Box>
                    <Box display="flex" justifyContent="center" width="100%">
                        <Typography variant="h6" component="div">
                            Admin Console
                        </Typography>
                    </Box>
                    <Box display="flex" flexGrow={1} justifyContent="flex-end">
                        {/* Here you can add icons for future actions */}
                    </Box>
                </Toolbar>
            </AppBar>
            <Box p={3}>
                <Box display="flex" alignItems="center" marginBottom={2}>
                    <TextField
                        label="Search Users"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </Box>

                <Paper elevation={3}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Permission</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {users.filter(user =>
                                user.name.toLowerCase().includes(search.toLowerCase()) && !user.deleted
                            ).map(user => (
                                <TableRow key={user.uid}>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <FormControl variant="outlined" size="small" fullWidth>
                                            <InputLabel>Permission</InputLabel>
                                            <Select
                                                label="Permission"
                                                value={user.permission}
                                                onChange={(e) => updateUser(user.uid, {permission: e.target.value as UserPermission})}
                                                fullWidth
                                            >
                                                <MenuItem value={UserPermission.READ}>Read</MenuItem>
                                                <MenuItem value={UserPermission.READ_WRITE}>Read & Write</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </TableCell>
                                    <TableCell>
                                        <FormControl variant="outlined" size="small" fullWidth>
                                            <InputLabel>Role</InputLabel>
                                            <Select
                                                label="Role"
                                                value={user.role}
                                                onChange={(e) => updateUser(user.uid, {role: e.target.value as UserRole})}
                                                fullWidth
                                            >
                                                <MenuItem value={UserRole.USER}>User</MenuItem>
                                                <MenuItem value={UserRole.ADMIN}>Admin</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip
                                            title="Disable or enable the user's account. When disabled, the user won't be able to log in or access the application.">
                                            <Button
                                                startIcon={<BlockIcon style={{color: 'white'}}/>}
                                                onClick={() => updateUser(user.uid, {disabled: !user.disabled})}
                                                sx={{
                                                    backgroundColor: user.disabled ? 'orange' : 'lightgrey',
                                                    color: 'white',
                                                    marginRight: 1,
                                                    '&:hover': {
                                                        backgroundColor: user.disabled ? '#FFA500' : 'grey',
                                                    }
                                                }}
                                            >
                                                {user.disabled ? 'Enable' : 'Disable'}
                                            </Button>
                                        </Tooltip>
                                        <Tooltip
                                            title="Permanently delete the user. This action cannot be undone, and the user's data will be completely removed from the system.">
                                            <Button
                                                startIcon={<DeleteIcon style={{color: 'white'}}/>}
                                                onClick={() => updateUser(user.uid, {deleted: true})}
                                                sx={{
                                                    backgroundColor: 'red',
                                                    color: 'white',
                                                    '&:hover': {
                                                        backgroundColor: 'darkred',
                                                    }
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>
            </Box>
        </>
    );
};

export default AdminDashboard;
