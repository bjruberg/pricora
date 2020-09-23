export const routes = {
  login: "/login",
  meetingadd: "/meetingadd",
  meetinglist: "/meetinglist",
  addattendant: (uuid = ":uuid"): string => `/addattendant/${uuid}`,
  register: "/register",
};
