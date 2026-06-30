import axiosInstance from './axiosInstance';

export interface Event {
  _id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  image_url?: string;
  club_id: {
    _id: string;
    name: string;
    logo_url: string;
  };
}

export const fetchEvents = async (): Promise<Event[]> => {
  const res = await axiosInstance.get('/events');
  return res.data;
};

export const fetchEventById = async (id: string): Promise<Event> => {
  const res = await axiosInstance.get(`/events/${id}`);
  return res.data;
};

export const createEvent = async (
  data: Partial<Event>,
  token: string
): Promise<Event> => {
  const res = await axiosInstance.post('/events', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateEvent = async (
  id: string,
  data: Partial<Event>,
  token: string
): Promise<Event> => {
  const res = await axiosInstance.put(`/events/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteEvent = async (id: string, token: string): Promise<void> => {
  await axiosInstance.delete(`/events/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
