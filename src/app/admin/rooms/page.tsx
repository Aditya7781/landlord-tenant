"use client";

import React, { useState, useEffect } from "react";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  KingBed as BedIcon,
} from "@mui/icons-material";

interface Room {
  id: string;
  number: string;
  totalBeds: number;
  occupiedBeds: number;
}

interface ApiRoom {
  roomNo: string;
  status: string;
  totalBeds: number;
  occupiedBeds: number;
  vacantBeds: number;
  occupancy: string;
}

interface ApiResponse {
  rooms: ApiRoom[];
}

const getCookieValue = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

export default function RoomManagement() {
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    const token = getCookieValue("session_token");
    if (!token) {
      console.error("No session_token found in cookies");
      return;
    }

    fetch("/api/rooms", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            `HTTP error! status: ${res.status}, statusText: ${res.statusText}`,
          );
        }
        return res.json();
      })
      .then((data: ApiResponse) => {
        
        const transformedRooms = data.rooms.map((room: ApiRoom) => ({
          id: room.roomNo,
          number: room.roomNo,
          totalBeds: room.totalBeds,
          occupiedBeds: room.occupiedBeds,
        }));
        setRooms(transformedRooms);
      })
      .catch((err) => {
        console.error("Failed to fetch rooms:", err);
      });
  }, []);

  /* ---------- Add Room ---------- */
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    number: "",
    totalBeds: 0,
  });

  /* ---------- Delete Room ---------- */
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  /* ---------- Edit Room ---------- */
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    roomNo: "",
    bedIndex: 0,
    operation: "add" as "add" | "remove",
  });

  const handleAddRoom = async () => {
    const token = getCookieValue("session_token");
    if (!token) {
      alert("No authentication token found");
      return;
    }

    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomNo: form.number,
          numberOfBeds: form.totalBeds,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Room added successfully");
        setOpen(false);
        setForm({ number: "", totalBeds: 0 });
        // Optionally refetch rooms
        window.location.reload();
      } else {
        alert(data.message || "Failed to add room");
      }
    } catch (error) {
      console.error("Add room error:", error);
      alert("Network error. Please try again.");
    }
  };

  const handleDeleteRoom = async () => {
    if (!selectedRoomId) return;

    const token = getCookieValue("session_token");
    if (!token) {
      alert("No authentication token found");
      return;
    }

    try {
      const response = await fetch("/api/rooms/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomNo: selectedRoomId,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(data.message || "Room deleted successfully");
        setDeleteOpen(false);
        setSelectedRoomId(null);
        // Refresh the rooms list
        window.location.reload();
      } else {
        alert(data.message || "Failed to delete room");
      }
    } catch (error) {
      console.error("Delete room error:", error);
      alert("Network error. Please try again.");
    }
  };

  const handleEditRoom = async () => {
    const token = getCookieValue("session_token");
    if (!token) {
      alert("No authentication token found");
      return;
    }

    try {
      const response = await fetch("/api/rooms/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomNo: editForm.roomNo,
          bedIndex: editForm.bedIndex,
          operation: editForm.operation,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(data.message || `Bed ${editForm.operation === "add" ? "added" : "removed"} successfully`);
        setEditOpen(false);
        setEditForm({ roomNo: "", bedIndex: 1, operation: "add" });
        // Refresh the rooms list
        window.location.reload();
      } else {
        alert(data.message || "Failed to edit room");
      }
    } catch (error) {
      console.error("Edit room error:", error);
      alert("Network error. Please try again.");
    }
  };

  const openEditDialog = (room: Room) => {
    // Calculate next bed index for add operation (0-based indexing)
    const nextBedIndex = room.totalBeds; // If 5 beds exist, next index is 5 (0,1,2,3,4 are taken)
    
    setEditForm({
      roomNo: room.number,
      bedIndex: nextBedIndex,
      operation: "add",
    });
    setEditOpen(true);
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
                      <IconButton 
                        size="small"
                        onClick={() => openEditDialog(room)}
                      >
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

      {/* ---------- Edit Room Dialog ---------- */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit Room - {editForm.roomNo}</DialogTitle>

        <DialogContent sx={{ display: "grid", gap: 2, mt: 1 }}>
          <TextField
            label="Room Number"
            value={editForm.roomNo}
            disabled
            fullWidth
          />
          <TextField
            label="Bed Index"
            type="number"
            value={editForm.bedIndex}
            disabled={editForm.operation === "add"}
            onChange={(e) =>
              setEditForm({ ...editForm, bedIndex: Number(e.target.value) })
            }
            fullWidth
            helperText={
              editForm.operation === "add" 
                ? "Automatically calculated as next available bed (0-based indexing)"
                : "Select a specific bed to remove from the dropdown below"
            }
            sx={{ display: editForm.operation === "remove" ? "none" : "block" }}
          />
          {editForm.operation === "remove" && (
            <FormControl fullWidth>
              <InputLabel>Select Bed to Remove</InputLabel>
              <Select
                value={editForm.bedIndex}
                label="Select Bed to Remove"
                onChange={(e) =>
                  setEditForm({ ...editForm, bedIndex: Number(e.target.value) })
                }
              >
                {(() => {
                  const room = rooms.find(r => r.number === editForm.roomNo);
                  if (!room) return <MenuItem value="">No room data</MenuItem>;
                  
                  return Array.from({ length: room.totalBeds }, (_, index) => {
                    const isOccupied = index < room.occupiedBeds;
                    return (
                      <MenuItem 
                        key={index} 
                        value={index}
                        disabled={isOccupied}
                        sx={{
                          color: isOccupied ? "text.secondary" : "text.primary",
                          backgroundColor: isOccupied ? "action.disabled" : "inherit"
                        }}
                      >
                        Bed {index} {isOccupied ? "(Occupied - Cannot remove)" : "(Vacant)"}
                      </MenuItem>
                    );
                  });
                })()}
              </Select>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Only vacant beds can be removed. Occupied beds are disabled.
              </Typography>
            </FormControl>
          )}
          <FormControl fullWidth>
            <InputLabel>Operation</InputLabel>
            <Select
              value={editForm.operation}
              label="Operation"
              onChange={(e) => {
                const newOperation = e.target.value as "add" | "remove";
                // If switching to add, recalculate bed index
                if (newOperation === "add") {
                  const room = rooms.find(r => r.number === editForm.roomNo);
                  const nextBedIndex = room ? room.totalBeds : 0; // 0-based indexing
                  setEditForm({ ...editForm, operation: newOperation, bedIndex: nextBedIndex });
                } else {
                  setEditForm({ ...editForm, operation: newOperation });
                }
              }}
            >
              <MenuItem value="add">Add Bed</MenuItem>
              <MenuItem value="remove">Remove Bed</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditRoom}>
            {editForm.operation === "add" ? "Add Bed" : "Remove Bed"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
