export const routes = {
  account: "/account",
  login: "/login",
  meetingadd: "/meetingadd",
  meetinglist: "/meetinglist",
  meeting: (uuid = ":uuid"): string => `/meeting/${uuid}`,
  addattendant: (uuid = ":uuid"): string => `/addattendant/${uuid}`,
  register: "/register",
};
