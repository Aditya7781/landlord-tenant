export interface User {
    id: string;
    name: string;
    email: string;
    room: string;
    bed: string;
    status: 'Active' | 'Pending' | 'Inactive';
    entryDate?: string;
}

export interface Room {
    id: string;
    number: string;
    totalBeds: number;
    occupiedBeds: number;
}

export interface Payment {
    id: string;
    user: string;
    amount: string;
    date: string;
    status: 'Paid' | 'Pending';
    method?: string;
    month: string;
    receiptNo?: string;
}

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    date: string;
    type: 'info' | 'reminder' | 'alert';
}

const mockUsers: User[] = [
    { id: '1', name: 'Sagar Kumar', email: 'sagar@example.com', room: '204', bed: 'B1', status: 'Active', entryDate: '2023-10-15' },
    { id: '2', name: 'Rahul Singh', email: 'rahul@example.com', room: '102', bed: 'A1', status: 'Active', entryDate: '2023-09-20' },
    { id: '3', name: 'Amit Sharma', email: 'amit@example.com', room: '-', bed: '-', status: 'Pending' },
    { id: '4', name: 'Vikram Jha', email: 'vikram@example.com', room: '305', bed: 'C2', status: 'Active', entryDate: '2023-11-01' },
];

const mockRooms: Room[] = [
    { id: '1', number: '101', totalBeds: 4, occupiedBeds: 2 },
    { id: '2', number: '102', totalBeds: 2, occupiedBeds: 2 },
    { id: '3', number: '201', totalBeds: 3, occupiedBeds: 0 },
    { id: '4', number: '204', totalBeds: 4, occupiedBeds: 3 },
    { id: '5', number: '301', totalBeds: 4, occupiedBeds: 1 },
];

const mockPayments: Payment[] = [
    { id: '1', user: 'Sagar Kumar', amount: '₹5,500', date: '2023-11-01', status: 'Paid', method: 'UPI', month: 'November 2023', receiptNo: 'REC-1241' },
    { id: '2', user: 'Rahul Singh', amount: '₹5,500', date: '2023-11-02', status: 'Paid', method: 'Card', month: 'November 2023', receiptNo: 'REC-1120' },
    { id: '3', user: 'Amit Sharma', amount: '₹5,500', date: '-', status: 'Pending', month: 'November 2023' },
    { id: '4', user: 'Vikram Jha', amount: '₹5,500', date: '2023-11-05', status: 'Paid', method: 'Cash', month: 'November 2023', receiptNo: 'REC-1010' },
];

const mockNotifications: AppNotification[] = [
    { id: '1', title: 'Monthly Fee Reminder', message: 'Please pay your monthly fee by the 10th of every month to avoid late charges.', date: '2 hours ago', type: 'reminder' },
    { id: '2', title: 'Water Tank Cleaning', message: 'The water tank will be cleaned this Sunday. Water supply will be unavailable from 10 AM to 2 PM.', date: '1 day ago', type: 'info' },
    { id: '3', title: 'New Guest Policy', message: 'We have updated our guest visiting hours. Please check the new policy at the reception.', date: '3 days ago', type: 'alert' },
];

export const mockApi = {
    getUsers: async () => {
        await new Promise(r => setTimeout(r, 800)); // Simulate delay
        return mockUsers;
    },
    getRooms: async () => {
        await new Promise(r => setTimeout(r, 800));
        return mockRooms;
    },
    getPayments: async () => {
        await new Promise(r => setTimeout(r, 800));
        return mockPayments;
    },
    getNotifications: async () => {
        await new Promise(r => setTimeout(r, 800));
        return mockNotifications;
    },
    // In a real app, these would be POST/PUT/DELETE requests
    updateUser: async (id: string, data: Partial<User>) => {
        console.log(`Updating user ${id}`, data);
        return { success: true };
    },
    assignRoom: async (userId: string, room: string, bed: string) => {
        console.log(`Assigning room ${room}, bed ${bed} to user ${userId}`);
        return { success: true };
    }
};
