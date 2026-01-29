"use client";

import React, { useState, useEffect } from "react";
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Hotel as HotelIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Description as DocumentIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";

interface Allocation {
  roomNo: string;
  bedNo: string;
  bedIndex?: number; // For unassign functionality
}

interface User {
  firstName: string;
  lastName: string;
  allocation?: Allocation;
  allocations?: Allocation[]; // Support multiple allocations
  status: string;
  emailAddress: string;
}

interface ApiResponse {
  users: User[];
}

interface UnoccupiedRoomsResponse {
  rooms?: Record<string, string[]>;
}

interface UserInfoAssignment {
  roomNo: string;
  bedName: string;
  amount: number;
  assignedAt: string;
  dueDate: string;
}

interface UserInfo {
  firstName: string;
  lastName: string;
  emailAddress: string;
  contactNo: string;
  guardianContactNo?: string;
  role: string;
  status: string;
  dateOfBirth?: string;
  fatherName?: string;
  motherName?: string;
  permanentAddress?: string;
  registrationDate?: string;
  updatedAt?: string;
  education?: {
    highestQualification?: string;
    collegeOffice?: string;
    purposeOfLiving?: string;
  };
  documents?: {
    profilePhoto?: string;
    aadharFront?: string;
    aadharBack?: string;
    idProof?: string;
  };
  assignments?: UserInfoAssignment[];
}

interface UserInfoResponse {
  user: UserInfo;
}

const getCookieValue = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const token = getCookieValue("session_token");
  const [loading, setLoading] = useState(!!token);

  const [editOpen, setEditOpen] = useState(false);
  const [editStatus, setEditStatus] = useState("");
  const [unassignOpen, setUnassignOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState<Allocation | null>(null);
  const [unassignLoading, setUnassignLoading] = useState(false);
  const [userAllocationIndices, setUserAllocationIndices] = useState<Record<string, number>>({});
  
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const [userDetails, setUserDetails] = useState<UserInfo | null>(null);
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);
  const [selectedAssignmentForUnassign, setSelectedAssignmentForUnassign] = useState<UserInfoAssignment | null>(null);

  const [unoccupiedRooms, setUnoccupiedRooms] = useState<
    Record<string, string[]>
  >({});
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomsError, setRoomsError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    fetch("/api/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data: ApiResponse) => {
        // Normalize allocations: convert single allocation to array format
        const normalizedUsers = data.users.map((user) => {
          const allocations: Allocation[] = [];
          
          // Handle both single allocation and allocations array
          if (user.allocations && Array.isArray(user.allocations)) {
            allocations.push(...user.allocations);
          } else if (user.allocation && user.allocation.roomNo && user.allocation.bedNo) {
            // Convert single allocation to array
            allocations.push(user.allocation);
          }
          
          return {
            ...user,
            allocations,
          };
        });
        
        setUsers(normalizedUsers);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch users:", err);
        setLoading(false);
      });
  }, [token]);

  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [roomNumber, setRoomNumber] = useState("");
  const [bedNo, setBedNo] = useState<string>("");
  const [amount, setAmount] = useState<number | "">("");
  const [dueDate, setDueDate] = useState("");

  const roomOptions = Object.keys(unoccupiedRooms);
  const bedOptions = roomNumber ? unoccupiedRooms[roomNumber] || [] : [];

  const bedIndexFromBedNo = (value: string): number | null => {
    // Backend returns "B1", "B2", ...; assign_room expects 0-based bedIndex.
    const match = /^B(\d+)$/.exec(value);
    if (!match) return null;
    const idx = Number(match[1]) - 1;
    return Number.isFinite(idx) && idx >= 0 ? idx : null;
  };

  const fetchUnoccupiedRooms = async () => {
    if (!token) return;
    setRoomsLoading(true);
    setRoomsError(null);
    try {
      const res = await fetch("/api/rooms/unoccupied", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: UnoccupiedRoomsResponse = await res.json();
      if (!res.ok) {
        setUnoccupiedRooms({});
        setRoomsError((data as any)?.message || "Failed to fetch rooms");
        return;
      }
      setUnoccupiedRooms(data.rooms || {});
    } catch (e) {
      console.error("Failed to fetch unoccupied rooms:", e);
      setUnoccupiedRooms({});
      setRoomsError("Network error. Please try again.");
    } finally {
      setRoomsLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      `${user.firstName} ${user.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      user.emailAddress.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleOpenAssign = (user: User) => {
    setSelectedUser(user);
    setRoomNumber("");
    setBedNo("");
    setAmount("");
    setDueDate(new Date().toISOString());
    setOpen(true);
    fetchUnoccupiedRooms();
  };

  const handleAssign = async () => {
    const computedBedIndex = bedIndexFromBedNo(bedNo);
    if (
      !selectedUser ||
      !roomNumber ||
      !bedNo ||
      computedBedIndex === null ||
      amount === "" ||
      !dueDate
    ) {
      alert("Please fill all fields");
      return;
    }

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userEmail: selectedUser.emailAddress,
          roomNo: roomNumber,
          bedIndex: computedBedIndex,
          amount: Number(amount),
          dueDate: dueDate,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Room assigned successfully!");
        setOpen(false);
        // Refresh the users list
        window.location.reload();
      } else {
        let errorMessage = data.message || "Failed to assign room";
        if (
          response.status === 409 ||
          errorMessage.toLowerCase().includes("already") ||
          errorMessage.toLowerCase().includes("occupied")
        ) {
          errorMessage = "Bed already occupied";
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Assign room error:", error);
      alert("Network error. Please try again.");
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedUser || !editStatus) {
      alert("Please select a status");
      return;
    }

    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: selectedUser.emailAddress,
          status: editStatus,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Status updated successfully!");
        setEditOpen(false);
        window.location.reload();
      } else {
        alert(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Update status error:", error);
      alert("Network error. Please try again.");
    }
  };

  const handleOpenUnassign = (user: User, allocationIndex: number = 0) => {
    const allocations = getUserAllocations(user);
    if (allocations.length === 0) return;
    
    setSelectedUser(user);
    setSelectedAllocation(allocations[allocationIndex]);
    setUserAllocationIndices({
      ...userAllocationIndices,
      [user.emailAddress]: allocationIndex,
    });
    setUnassignOpen(true);
  };

  const handleUnassign = async () => {
    if (!selectedUser || !selectedAllocation) {
      alert("Please select an allocation to unassign");
      return;
    }

    if (!token) {
      alert("No authentication token found");
      return;
    }

    // Calculate bedIndex from bedNo (B1 -> 0, B2 -> 1, etc.)
    const bedIndex = bedIndexFromBedNo(selectedAllocation.bedNo);
    if (bedIndex === null) {
      alert("Invalid bed number format");
      return;
    }

    setUnassignLoading(true);
    try {
      const response = await fetch("/api/users/unassign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userEmail: selectedUser.emailAddress,
          roomNo: selectedAllocation.roomNo,
          bedIndex: bedIndex,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Room unassigned successfully!");
        setUnassignOpen(false);
        // If user details dialog was open, refresh it
        if (userDetails) {
          handleOpenUserDetails(userDetails.emailAddress);
        } else {
          window.location.reload();
        }
      } else {
        alert(data.message || "Failed to unassign room");
      }
    } catch (error) {
      console.error("Unassign room error:", error);
      alert("Network error. Please try again.");
    } finally {
      setUnassignLoading(false);
    }
  };

  const getUserAllocations = (user: User): Allocation[] => {
    return user.allocations || (user.allocation ? [user.allocation] : []);
  };

  const handleOpenUserDetails = async (userEmail: string) => {
    if (!token) {
      alert("No authentication token found");
      return;
    }

    setUserDetailsOpen(true);
    setUserDetailsLoading(true);
    setUserDetails(null);

    try {
      const response = await fetch(`/api/users/info?email=${encodeURIComponent(userEmail)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.user) {
        setUserDetails(data.user);
      } else {
        alert((data as any).message || "Failed to fetch user details");
        setUserDetailsOpen(false);
      }
    } catch (error) {
      console.error("Fetch user details error:", error);
      alert("Network error. Please try again.");
      setUserDetailsOpen(false);
    } finally {
      setUserDetailsLoading(false);
    }
  };

  const handleUnassignFromDetails = (assignment: UserInfoAssignment) => {
    if (!userDetails) return;
    
    setSelectedAssignmentForUnassign(assignment);
    // Calculate bedIndex from bedName (B1 -> 0, B2 -> 1, etc.)
    const bedIndex = bedIndexFromBedNo(assignment.bedName);
    if (bedIndex === null) {
      alert("Invalid bed number format");
      return;
    }

    // Create a temporary user object for unassign dialog
    const tempUser: User = {
      firstName: userDetails.firstName,
      lastName: userDetails.lastName,
      emailAddress: userDetails.emailAddress,
      status: userDetails.status,
      allocations: userDetails.assignments?.map(assign => ({
        roomNo: assign.roomNo,
        bedNo: assign.bedName,
        bedIndex: bedIndexFromBedNo(assign.bedName) || undefined,
      })) || [],
    };

    setSelectedUser(tempUser);
    setSelectedAllocation({
      roomNo: assignment.roomNo,
      bedNo: assignment.bedName,
      bedIndex: bedIndex,
    });
    setUnassignOpen(true);
    setUserDetailsOpen(false);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography>Loading users...</Typography>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography>No users found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.emailAddress} hover>
                  <TableCell>
                    <Box 
                      sx={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: 2,
                        cursor: "pointer",
                        "&:hover": { opacity: 0.7 }
                      }}
                      onClick={() => handleOpenUserDetails(user.emailAddress)}
                    >
                      <Avatar sx={{ bgcolor: "primary.main", fontWeight: 700 }}>
                        {user.firstName[0]}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {user.firstName} {user.lastName}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>{user.emailAddress}</TableCell>

                  <TableCell>
                    {(() => {
                      const allocations = getUserAllocations(user);
                      if (allocations.length === 0) {
                        return (
                          <Typography variant="caption" color="text.secondary">
                            Not Assigned
                          </Typography>
                        );
                      }
                      
                      if (allocations.length === 1) {
                        const alloc = allocations[0];
                        return (
                          <Box sx={{ display: "flex", gap: 0.5 }}>
                            <Chip
                              label={`R-${alloc.roomNo}`}
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                            <Chip
                              label={`B-${alloc.bedNo}`}
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 600 }}
                            />
                          </Box>
                        );
                      }
                      
                      // Multiple allocations - show dropdown
                      const currentIndex = userAllocationIndices[user.emailAddress] || 0;
                      return (
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                          <Select
                            value={currentIndex}
                            onChange={(e) => {
                              const idx = Number(e.target.value);
                              setUserAllocationIndices({
                                ...userAllocationIndices,
                                [user.emailAddress]: idx,
                              });
                            }}
                            sx={{ height: 32 }}
                          >
                            {allocations.map((alloc, idx) => (
                              <MenuItem key={idx} value={idx}>
                                R-{alloc.roomNo} / B-{alloc.bedNo}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      );
                    })()}
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={user.status || "N/A"}
                      size="small"
                      color={
                        user.status === "active"
                          ? "success"
                          : user.status === "pending" ||
                              user.status === "peding"
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
                    {/* {getUserAllocations(user).length > 0 && (
                      <IconButton
                        size="small"
                        onClick={() => {
                          const allocations = getUserAllocations(user);
                          const idx = allocations.length > 1 
                            ? (userAllocationIndices[user.emailAddress] || 0)
                            : 0;
                          handleOpenUnassign(user, idx);
                        }}
                        title="Unassign Room"
                      >
                        <CloseIcon fontSize="small" color="error" />
                      </IconButton>
                    )} */}
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedUser(user);
                        setEditStatus(user.status || "");
                        setEditOpen(true);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>

                    <IconButton size="small">
                      <DeleteIcon fontSize="small" color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
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
              {selectedUser?.firstName} {selectedUser?.lastName}
            </Box>
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                select
                label="Room Number"
                InputLabelProps={{ shrink: true }}
                value={roomNumber}
                onChange={(e) => {
                  setRoomNumber(e.target.value);
                  setBedNo("");
                }}
                disabled={roomsLoading || roomOptions.length === 0}
                helperText={
                  roomsLoading
                    ? "Loading available rooms..."
                    : roomsError
                      ? roomsError
                      : roomOptions.length === 0
                        ? "No unoccupied rooms available"
                        : "Select a room"
                }
                SelectProps={{
                  native: true,
                }}
              >
                <option value="">Select room</option>
                {roomOptions.map((room) => (
                  <option key={room} value={room}>
                    {room}
                  </option>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                select
                label="Bed"
                InputLabelProps={{ shrink: true }}
                value={bedNo}
                onChange={(e) => setBedNo(e.target.value)}
                disabled={!roomNumber || bedOptions.length === 0}
                helperText={
                  !roomNumber
                    ? "Select a room first"
                    : bedOptions.length === 0
                      ? "No beds available in this room"
                      : "Select a bed"
                }
                SelectProps={{
                  native: true,
                }}
              >
                <option value="">Select bed</option>
                {bedOptions.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Amount"
                placeholder="e.g. 2000"
                type="number"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value === "" ? "" : Number(e.target.value))
                }
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Due Date"
                placeholder="YYYY-MM-DDTHH:MM:SSZ"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
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

      {/* ---------- Edit User Status Dialog ---------- */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Update User Status</DialogTitle>

        <DialogContent>
          <Typography sx={{ mb: 2, color: "text.secondary" }}>
            Updating status for{" "}
            <Box
              component="span"
              sx={{ fontWeight: 700, color: "text.primary" }}
            >
              {selectedUser?.firstName} {selectedUser?.lastName}
            </Box>
          </Typography>

          <TextField
            id="user-status"
            select
            fullWidth
            label="Status"
            value={editStatus}
            onChange={(e) => setEditStatus(e.target.value)}
            SelectProps={{
              native: true,
              inputProps: {
                "aria-label": "User status",
              },
            }}
          >
            <option value="">Select status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </TextField>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setEditOpen(false)} sx={{ fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            sx={{ px: 3, fontWeight: 700 }}
            onClick={handleUpdateStatus}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---------- Unassign Room Dialog ---------- */}
      <Dialog
        open={unassignOpen}
        onClose={() => setUnassignOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Unassign Room & Bed</DialogTitle>

        <DialogContent>
          <Typography sx={{ mb: 3, color: "text.secondary" }}>
            Are you sure you want to unassign{" "}
            <Box
              component="span"
              sx={{ fontWeight: 700, color: "text.primary" }}
            >
              {selectedUser?.firstName} {selectedUser?.lastName}
            </Box>
            {" "}from{" "}
            {selectedAllocation && (
              <Box
                component="span"
                sx={{ fontWeight: 700, color: "text.primary" }}
              >
                Room {selectedAllocation.roomNo}, Bed {selectedAllocation.bedNo}
              </Box>
            )}
            ?
          </Typography>
          
          {selectedUser && getUserAllocations(selectedUser).length > 1 && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select Allocation to Unassign</InputLabel>
              <Select
                value={userAllocationIndices[selectedUser.emailAddress] || 0}
                onChange={(e) => {
                  const idx = Number(e.target.value);
                  setUserAllocationIndices({
                    ...userAllocationIndices,
                    [selectedUser.emailAddress]: idx,
                  });
                  const allocations = getUserAllocations(selectedUser);
                  setSelectedAllocation(allocations[idx]);
                }}
                label="Select Allocation to Unassign"
              >
                {getUserAllocations(selectedUser).map((alloc, idx) => (
                  <MenuItem key={idx} value={idx}>
                    Room {alloc.roomNo}, Bed {alloc.bedNo}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Typography variant="body2" color="warning.main" sx={{ mt: 2 }}>
            This action cannot be undone. The room and bed will become available for other residents.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setUnassignOpen(false)} 
            sx={{ fontWeight: 700 }}
            disabled={unassignLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            sx={{ px: 3, fontWeight: 700 }}
            onClick={handleUnassign}
            disabled={unassignLoading}
          >
            {unassignLoading ? "Unassigning..." : "Confirm Unassign"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---------- User Details Dialog ---------- */}
      <Dialog
        open={userDetailsOpen}
        onClose={() => {
          setUserDetailsOpen(false);
          setUserDetails(null);
        }}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {userDetails?.documents?.profilePhoto ? (
              <Avatar
                src={userDetails.documents.profilePhoto}
                sx={{ width: 60, height: 60 }}
              />
            ) : (
              <Avatar sx={{ width: 60, height: 60, bgcolor: "primary.main", fontSize: "1.5rem" }}>
                {userDetails?.firstName?.[0] || "U"}
              </Avatar>
            )}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {userDetails?.firstName} {userDetails?.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {userDetails?.emailAddress}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent>
          {userDetailsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <Typography>Loading user details...</Typography>
            </Box>
          ) : userDetails ? (
            <Box>
              <Grid container spacing={3}>
                {/* Personal Information */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                    <PersonIcon fontSize="small" />
                    Personal Information
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="caption" color="text.secondary">Date of Birth</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {userDetails.dateOfBirth || "N/A"}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="caption" color="text.secondary">Role</Typography>
                        <Chip label={userDetails.role || "N/A"} size="small" sx={{ mt: 0.5 }} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="caption" color="text.secondary">Status</Typography>
                        <Chip
                          label={userDetails.status || "N/A"}
                          size="small"
                          color={userDetails.status === "active" ? "success" : "warning"}
                          sx={{ mt: 0.5 }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="caption" color="text.secondary">Registration Date</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatDate(userDetails.registrationDate)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Contact Information */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                    <PhoneIcon fontSize="small" />
                    Contact Information
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="caption" color="text.secondary">Contact Number</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {userDetails.contactNo || "N/A"}
                        </Typography>
                      </Grid>
                      {userDetails.guardianContactNo && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="caption" color="text.secondary">Guardian Contact</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {userDetails.guardianContactNo}
                          </Typography>
                        </Grid>
                      )}
                      {userDetails.fatherName && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="caption" color="text.secondary">Father's Name</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {userDetails.fatherName}
                          </Typography>
                        </Grid>
                      )}
                      {userDetails.motherName && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="caption" color="text.secondary">Mother's Name</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {userDetails.motherName}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Paper>
                </Grid>

                {/* Address */}
                {userDetails.permanentAddress && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                      <HomeIcon fontSize="small" />
                      Permanent Address
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="body2">{userDetails.permanentAddress}</Typography>
                    </Paper>
                  </Grid>
                )}

                {/* Education */}
                {userDetails.education && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                      <SchoolIcon fontSize="small" />
                      Education
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Grid container spacing={2}>
                        {userDetails.education.highestQualification && (
                          <Grid size={{ xs: 12 }}>
                            <Typography variant="caption" color="text.secondary">Highest Qualification</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {userDetails.education.highestQualification}
                            </Typography>
                          </Grid>
                        )}
                        {userDetails.education.collegeOffice && (
                          <Grid size={{ xs: 12 }}>
                            <Typography variant="caption" color="text.secondary">College/Office</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {userDetails.education.collegeOffice}
                            </Typography>
                          </Grid>
                        )}
                        {userDetails.education.purposeOfLiving && (
                          <Grid size={{ xs: 12 }}>
                            <Typography variant="caption" color="text.secondary">Purpose of Living</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {userDetails.education.purposeOfLiving}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Paper>
                  </Grid>
                )}

                {/* Documents */}
                {userDetails.documents && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                      <DocumentIcon fontSize="small" />
                      Documents
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Grid container spacing={2}>
                        {Object.entries(userDetails.documents).map(([key, url]) => (
                          url && (
                            <Grid size={{ xs: 12, sm: 6 }} key={key}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ textTransform: "capitalize" }}>
                                  {key.replace(/([A-Z])/g, " $1").trim()}:
                                </Typography>
                                <Button
                                  size="small"
                                  startIcon={<ViewIcon />}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  sx={{ textTransform: "none" }}
                                >
                                  View
                                </Button>
                              </Box>
                            </Grid>
                          )
                        ))}
                      </Grid>
                    </Paper>
                  </Grid>
                )}

                {/* Assignments/Allocations */}
                {userDetails.assignments && userDetails.assignments.length > 0 && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                      <HotelIcon fontSize="small" />
                      Room Assignments ({userDetails.assignments.length})
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 700 }}>Room</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Bed</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Assigned At</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Due Date</TableCell>
                              <TableCell sx={{ fontWeight: 700 }} align="right">Action</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {userDetails.assignments.map((assignment, idx) => (
                              <TableRow key={idx} hover>
                                <TableCell>
                                  <Chip label={`R-${assignment.roomNo}`} size="small" sx={{ fontWeight: 600 }} />
                                </TableCell>
                                <TableCell>
                                  <Chip label={`B-${assignment.bedName}`} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>
                                  ₹{assignment.amount.toLocaleString("en-IN")}
                                </TableCell>
                                <TableCell>{formatDate(assignment.assignedAt)}</TableCell>
                                <TableCell>{formatDate(assignment.dueDate)}</TableCell>
                                <TableCell align="right">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleUnassignFromDetails(assignment)}
                                    title="Unassign this room/bed"
                                  >
                                    <CloseIcon fontSize="small" />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          ) : null}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => {
              setUserDetailsOpen(false);
              setUserDetails(null);
            }}
            sx={{ fontWeight: 700 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
