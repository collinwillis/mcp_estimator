import {
  HomeRepairServiceOutlined,
  House,
  HouseRounded,
} from "@mui/icons-material";
import {
  Box,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useWbs } from "../hooks/wbs_hook";

export default function WbsDropdown() {
  const { proposalId, wbsId } = useParams();
  const { data, loading } = useWbs({ currentProposalId: proposalId! });
  const navigate = useNavigate();
  return (
    <Box sx={{ width: "100%", pt: "20px" }}>
      <FormControl variant="standard" sx={{ display: "flex" }}>
        <InputLabel id="demo-simple-select-filled-label" sx={{ pl: "10px" }}>
          Select WBS
        </InputLabel>
        <Select
          labelId="demo-simple-select-filled-label"
          id="demo-simple-select-filled"
          value={wbsId ? wbsId : ""}
          sx={{
            "& .MuiSelect-select": {
              textOverflow: "ellipsis",
              overflow: "hidden",
              textAlign: "center",
            },
            "& .MuiSelect-root": {
              minWidth: "200px",
              borderRadius: "20px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              backgroundColor: "white",
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
            },
          }}
        >
          <MenuItem value="" disabled>
            Select Wbs
          </MenuItem>
          {data.map((item) => (
            <MenuItem
              key={item.id}
              value={item.id}
              onClick={() => {
                navigate("/proposal/" + proposalId + "/wbs/" + item.id);
              }}
              sx={{
                padding: "5px 10px",
                minWidth: "200px",
                textAlign: "center",
              }}
            >
              <ListItemText
                primary={item.wbsDatabaseId + " " + item.name}
                sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
              />
            </MenuItem>
          ))}
          <Divider />
        </Select>
      </FormControl>
    </Box>
  );
}
