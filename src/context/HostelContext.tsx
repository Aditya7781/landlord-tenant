"use client";

import React, { createContext, useContext, useState } from "react";
import { Room, User } from "@/services/mockApi";

type HostelContextType = {
  rooms: Room[];
  users: User[];
  assignBed: (userId: string, roomNumber: string, bed: string) => void;
};

const HostelContext = createContext<HostelContextType | null>(null);

export function HostelProvider({
  initialRooms,
  initialUsers,
  children,
}: {
  initialRooms: Room[];
  initialUsers: User[];
  children: React.ReactNode;
}) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [users, setUsers] = useState<User[]>(initialUsers);

  const assignBed = (userId: string, roomNumber: string, bed: string) => {
    // update user
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, room: roomNumber, bed, status: "Active" } : u
      )
    );

    // update room occupancy
    setRooms((prev) =>
      prev.map((r) =>
        r.number === roomNumber ? { ...r, occupiedBeds: r.occupiedBeds + 1 } : r
      )
    );
  };

  return (
    <HostelContext.Provider value={{ rooms, users, assignBed }}>
      {children}
    </HostelContext.Provider>
  );
}

export const useHostel = () => {
  const ctx = useContext(HostelContext);
  if (!ctx) throw new Error("useHostel must be used inside HostelProvider");
  return ctx;
};
