import { Server } from "./server";
import { Users } from "./users";


export interface CustomResponse {
    timeStamp: Date;
    statusCode: number;
    status: string;
    reason: string;
    message: string;
    developerMessage: string;
    data: { servers?: Server[], server?: Server, users?: Users[], user?: Users};
}