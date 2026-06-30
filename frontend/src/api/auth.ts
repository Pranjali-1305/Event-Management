import axiosInstance from './axiosInstance';

export const adminLogin = async (credentials: {
  username: string;
  password: string;
}): Promise<{ token: string }> => {
  const res = await axiosInstance.post('/admin/login', credentials);
  return res.data;
};

export const adminSignup = async (data: {
  username: string;
  password: string;
  club_id: string;
}): Promise<{ token: string }> => {
  const res = await axiosInstance.post('/admin/signup', data);
  return res.data;
};
