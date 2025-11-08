export interface Booking {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  pastor: {
    _id: string;
    name: string;
    email: string;
  };
  date: string;
  timeSlot: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}