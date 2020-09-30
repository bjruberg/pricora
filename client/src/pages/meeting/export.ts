import download from "downloadjs";
import { routes } from "../../routes";

export const downloadExport = (uuid: string): void => {
  void fetch(routes.exportMeeting(uuid), {
    method: "GET",
  }).then((response) => {
    let filename = "";
    const disposition = response.headers.get("content-disposition");
    if (disposition && disposition.indexOf("attachment") !== -1) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(disposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, "");
      }
    }
    return response.blob().then((blob) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      download(blob, filename);
    });
  });
};
