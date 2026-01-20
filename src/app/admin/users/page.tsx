"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from "@mui/material";
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Hotel as HotelIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import { useHostel } from "@/context/HostelContext";

export default function UserManagement() {
  const { users, rooms, assignBed } = useHostel();

  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [roomNumber, setRoomNumber] = useState("");
  const [bedNumber, setBedNumber] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAssign = (user: any) => {
    setSelectedUser(user);
    setRoomNumber(user.room !== "-" ? user.room : "");
    setBedNumber(user.bed !== "-" ? user.bed : "");
    setOpen(true);
  };

  const handleAssign = () => {
    if (!selectedUser || !roomNumber || !bedNumber) return;

    assignBed(selectedUser.id, roomNumber, bedNumber);
    setOpen(false);
  };

  return (
    <Box>
      {/* ---------- Header ---------- */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            User Management
          </Typography>
          <Typography color="text.secondary">
            Review applications and manage resident room assignments
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search residents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            sx={{ borderRadius: 2 }}
          >
            Filter
          </Button>
        </Box>
      </Box>

      {/* ---------- Table ---------- */}
      <TableContainer component={Paper} sx={{ borderRadius: 4 }}>
        <Table>
          <TableHead sx={{ bgcolor: "action.hover" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Resident</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Allocation</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: "primary.main", fontWeight: 700 }}>
                      {user.name[0]}
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {user.name}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>{user.email}</TableCell>

                <TableCell>
                  {user.room !== "-" ? (
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <Chip
                        label={`R-${user.room}`}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                      <Chip
                        label={`B-${user.bed}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      Not Assigned
                    </Typography>
                  )}
                </TableCell>

                <TableCell>
                  <Chip
                    label={user.status}
                    size="small"
                    color={
                      user.status === "Active"
                        ? "success"
                        : user.status === "Pending"
                        ? "warning"
                        : "default"
                    }
                    sx={{ fontWeight: 700 }}
                  />
                </TableCell>

                <TableCell align="right">
                  <IconButton
                    onClick={() => handleOpenAssign(user)}
                    title="Assign Room"
                  >
                    <HotelIcon fontSize="small" color="primary" />
                  </IconButton>
                  <IconButton size="small">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small">
                    <DeleteIcon fontSize="small" color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ---------- Assign Room Dialog ---------- */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Assign Room & Bed</DialogTitle>

        <DialogContent>
          <Typography sx={{ mb: 3, color: "text.secondary" }}>
            Allocating space for{" "}
            <Box
              component="span"
              sx={{ fontWeight: 700, color: "text.primary" }}
            >
              {selectedUser?.name}
            </Box>
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                select
                fullWidth
                label="Room Number"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                SelectProps={{ native: true }}
              >
                <option value=""></option>
                {rooms.map((room) => (
                  <option
                    key={room.id}
                    value={room.number}
                    disabled={room.occupiedBeds >= room.totalBeds}
                  >
                    Room {room.number} ({room.totalBeds - room.occupiedBeds}{" "}
                    beds free)
                  </option>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Bed Number"
                placeholder="e.g. B1"
                value={bedNumber}
                onChange={(e) => setBedNumber(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)} sx={{ fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            sx={{ px: 3, fontWeight: 700 }}
            onClick={handleAssign}
          >
            Confirm Assignment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
