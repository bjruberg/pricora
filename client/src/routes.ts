export const routes = {
  account: "/account",
  exportMeeting: (uuid: string): string => `/api/exportMeeting?id=${uuid}`,
  login: "/login",
  meetingadd: "/meetingadd",
  meetinglist: "/meetinglist",
  meeting: (uuid = ":uuid"): string => `/meeting/${uuid}`,
  addattendant: (uuid = ":uuid"): string => `/addattendant/${uuid}`,
  register: "/register",
};
