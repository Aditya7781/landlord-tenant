"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  KingBed as BedIcon,
} from "@mui/icons-material";
import { useHostel } from "@/context/HostelContext";

export default function RoomManagement() {
  const { rooms } = useHostel();

  /* ---------- Add Room ---------- */
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    number: "",
    totalBeds: 0,
    occupiedBeds: 0,
  });

  /* ---------- Delete Room ---------- */
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const handleAddRoom = () => {
    // ❗ Frontend-only placeholder
    console.warn("Add Room should call backend later");
    setOpen(false);
    setForm({ number: "", totalBeds: 0, occupiedBeds: 0 });
  };

  const handleDeleteRoom = () => {
    // ❗ Frontend-only placeholder
    console.warn("Delete Room should call backend later");
    setDeleteOpen(false);
    setSelectedRoomId(null);
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
            Room Management
          </Typography>
          <Typography color="text.secondary">
            Manage floor-wise room inventory and bed availability
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ borderRadius: 2 }}
          onClick={() => setOpen(true)}
        >
          Add New Room
        </Button>
      </Box>

      {/* ---------- Room Grid ---------- */}
      <Grid container spacing={3}>
        {rooms.map((room) => {
          const occupancy = (room.occupiedBeds / room.totalBeds) * 100;

          return (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={room.id}>
              <Card
                sx={{
                  borderRadius: 4,
                  height: "100%",
                  transition: "all 0.3s",
                  "&:hover": {
                    boxShadow: 6,
                    transform: "translateY(-4px)",
                  },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        Room {room.number}
                      </Typography>
                      <Chip
                        label={
                          occupancy === 100
                            ? "Full"
                            : occupancy === 0
                            ? "Empty"
                            : "Available"
                        }
                        size="small"
                        color={
                          occupancy === 100
                            ? "error"
                            : occupancy === 0
                            ? "success"
                            : "warning"
                        }
                        sx={{ mt: 1, fontWeight: 600 }}
                      />
                    </Box>

                    <Box>
                      <IconButton size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedRoomId(room.id);
                          setDeleteOpen(true);
                        }}
                      >
                        <DeleteIcon fontSize="small" color="error" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Occupancy
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {room.occupiedBeds}/{room.totalBeds} Beds
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={occupancy}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  <Box sx={{ display: "flex", gap: 1 }}>
                    <BedIcon color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {room.totalBeds - room.occupiedBeds} beds currently vacant
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* ---------- Add Room Dialog ---------- */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add New Room</DialogTitle>

        <DialogContent sx={{ display: "grid", gap: 2, mt: 1 }}>
          <TextField
            label="Room Number"
            value={form.number}
            onChange={(e) => setForm({ ...form, number: e.target.value })}
            fullWidth
          />
          <TextField
            label="Total Beds"
            type="number"
            value={form.totalBeds}
            onChange={(e) =>
              setForm({ ...form, totalBeds: Number(e.target.value) })
            }
            fullWidth
          />
          <TextField
            label="Occupied Beds"
            type="number"
            value={form.occupiedBeds}
            onChange={(e) =>
              setForm({ ...form, occupiedBeds: Number(e.target.value) })
            }
            fullWidth
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddRoom}>
            Add Room
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---------- Delete Confirmation Dialog ---------- */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete Room</DialogTitle>

        <DialogContent>
          <Typography>
            Are you sure you want to delete this room? This action cannot be
            undone.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteRoom}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
