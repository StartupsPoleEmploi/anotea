import queryString from "query-string";
import { getToken } from "../utils/session";

export const getEmailPreviewUrl = (type, templateName) => {
    let publicUrl = process.env.PUBLIC_URL ? "" : "http://localhost:8080";
    let token = getToken();

    return `${publicUrl}/api/backoffice/emails-preview/${type}/templates/${templateName}?${queryString.stringify({ token })}`;
};

