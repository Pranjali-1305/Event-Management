import axiosInstance from './axiosInstance';

export interface TentativeDate {
  _id: string;
  label: string;
  date: string;
}

export interface Club {
  _id: string;
  name: string;
  logo_url: string;
  tentative_dates: TentativeDate[];
}

export const fetchClubs = async (): Promise<Club[]> => {
  const res = await axiosInstance.get('/clubs');
  return res.data;
};

export const addTentativeDate = async (
  clubId: string,
  data: { label: string; date: string },
  token: string
): Promise<Club> => {
  const res = await axiosInstance.put(`/clubs/${clubId}/tentative-dates`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteTentativeDate = async (
  clubId: string,
  entryId: string,
  token: string
): Promise<Club> => {
  const res = await axiosInstance.delete(`/clubs/${clubId}/tentative-dates/${entryId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
