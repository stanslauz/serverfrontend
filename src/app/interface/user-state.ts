import { DataState } from "../enum/data-state.enum";
export interface UserState<T> {
    dataState: DataState;
    appData?: T;
    error?: string;
}