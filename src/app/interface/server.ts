import { Status } from "../enum/status.enum";

export interface Server {
    id: number;
    ipAddress: string;
    port: any;
    name: string;
    memory: string;
    type: string;
    imageUrl: string;
    status: Status;
    users: any
}