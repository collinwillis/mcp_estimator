import React from "react";
import background from '../../../public/bg_image.jpg';
import logo from '../../../public/indemand_logo.png';

function ProposalSelectScreen() {
    return (
        <div style={{
            height: "100%",
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), url(${background})`,
            backgroundSize: 'cover',
            margin: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column'  // Added to stack the children vertically
        }}>
            <img src={logo} alt="Company Logo"
                 style={{
                     maxWidth: '350px',
                     maxHeight: '350px',
                     borderRadius: '25px'
                 }}/> {/* Adjust the size as needed */}
        </div>
    );
}

export default ProposalSelectScreen;
