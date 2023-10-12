import {
    CircularProgress,
    Dialog,
    DialogTitle,
    Divider,
    IconButton,
    InputBase,
    List,
    ListItem,
    ListItemText,
    Paper,
    Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import {Proposal} from "../../../models/proposal";
import {useProposals} from "../../../hooks/proposals_hook";
import DeleteConfirmationDialog from "../../../components/alert_dialog";
import React, {useState} from "react";
import {styled} from '@mui/system';
import {ArrowBackIcon, SearchIcon} from "@chakra-ui/icons";
import {deleteProposalAndAssociatedData} from '../../../api/proposal';

interface EditProposalsDialogProps {
    open: boolean;
    onClose: () => void;
    onDelete: (proposalId: string) => void;
}

const StyledDialog = styled(Dialog)(({theme}) => ({
    '& .MuiDialogTitle-root': {
        backgroundColor: "#007AFF",
        color: 'white',
        padding: theme.spacing(2),
        position: 'sticky',
        top: 0,
        zIndex: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    '& .MuiTypography-h6': {
        color: 'white',
    },
    '& .MuiListItem-root': {
        '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)', // Adjust the background color
        },
    },
}));

const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.2)', // Adjust opacity as needed
    zIndex: 9999, // Ensure it's above the dialog
};

const centeredProgressStyle: React.CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 10000, // Ensure it's above the dim overlay
};

const ScrollableContent = styled('div')(({theme}) => ({
    overflowY: 'auto',
    height: '55vh', // You can adjust this value as needed

}));

const SearchBar = styled('div')(({theme}) => ({
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(1, 2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: '64px', // Adjust this value as needed to match the header height
    zIndex: 1, // Ensure it's above the scrollable content
    elevation: 0, // Remove elevation
}));


const StyledIconButton = styled(IconButton)(({theme}) => ({
    backgroundColor: 'transparent',
    color: theme.palette.error.main,
    transition: 'color 0.3s',
    pointerEvents: 'none', // Disable pointer events on the button
    '&:hover': {
        color: theme.palette.error.dark,
        backgroundColor: 'transparent',
        pointerEvents: 'auto', // Re-enable pointer events on hover
    },
}));

const EditProposalsDialog: React.FC<EditProposalsDialogProps> = ({open, onClose, onDelete}) => {
    const {data, loading} = useProposals();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [showOverlay, setShowOverlay] = useState(false);
    const filteredData = data.filter((proposal: Proposal) => {
        const searchText = `${proposal.proposalNumber} - ${proposal.proposalDescription}`.toLowerCase();
        return searchText.includes(searchTerm.toLowerCase());
    });

    return (
        <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <IconButton edge="start" aria-label="back" onClick={onClose} sx={{marginRight: 2, color: 'white'}}>
                    <ArrowBackIcon/>
                </IconButton>
                <Typography variant="h6" sx={{flex: 1, textAlign: 'center'}}>Edit Proposals</Typography>
            </DialogTitle>
            <SearchBar>
                <InputBase
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <IconButton aria-label="search">
                    <SearchIcon/>
                </IconButton>
            </SearchBar>
            <ScrollableContent>
                <List component={Paper} elevation={0}>
                    {filteredData.map((proposal: Proposal, index: number) => (
                        <React.Fragment key={proposal.id}>
                            <ListItem disableRipple button>
                                <ListItemText primary={
                                    <Typography variant="body1" color="textPrimary">
                                        {proposal.proposalNumber + " - " + proposal.proposalDescription}
                                    </Typography>
                                }/>
                                <StyledIconButton
                                    edge="end"
                                    aria-label="delete"
                                    onClick={() => {
                                        setSelectedProposal(proposal);
                                        setDeleteDialogOpen(true);
                                    }}
                                    sx={{pointerEvents: 'auto'}}
                                >
                                    {isDeleting ? <CircularProgress size={20}/> : <DeleteIcon/>}
                                </StyledIconButton>
                            </ListItem>
                            {index < filteredData.length - 1 && <Divider/>}
                        </React.Fragment>
                    ))}
                </List>
            </ScrollableContent>
            <DeleteConfirmationDialog
                title={
                    <>
                        <Typography component="span">
                            {"Are you sure you would like to delete: "}
                        </Typography>
                        <Typography component="span" sx={{color: theme => theme.palette.primary.dark}}>
                            {selectedProposal?.proposalNumber + " - " + selectedProposal?.proposalDescription}
                        </Typography>
                    </>
                }
                content="Once deleted, this proposal and all of its data cannot be recovered."
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={async () => {
                    setDeleteDialogOpen(false);
                    setIsDeleting(true); // Set loading state to true
                    await deleteProposalAndAssociatedData(selectedProposal!.id!);
                    setIsDeleting(false); // Set loading state to false when delete is complete
                }}
            />
            {/* Dim overlay */}
            {isDeleting && <div style={overlayStyle}/>}

            {/* Centered CircularProgress */}
            {/*{!isDeleting && (*/}
            {/*    <div style={centeredProgressStyle}>*/}
            {/*        <CircularProgress size={100}/>*/}
            {/*    </div>*/}
            {/*)}*/}

        </StyledDialog>
    );
};

export default EditProposalsDialog;
