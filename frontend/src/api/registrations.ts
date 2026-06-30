import axiosInstance from './axiosInstance';

export interface Registration {
  _id: string;
  event_id: {
    _id: string;
    title: string;
    date: string;
  };
  name: string;
  email: string;
}

export const registerForEvent = async (data: {
  event_id: string;
  name: string;
  email: string;
}): Promise<{ _id: string; event_id: string; name: string; email: string }> => {
  const res = await axiosInstance.post('/register', data);
  return res.data;
};

export const fetchAdminRegistrations = async (token: string): Promise<Registration[]> => {
  const res = await axiosInstance.get('/admin/registrations', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
