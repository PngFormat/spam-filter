export interface IMessage {
    id: number;
    text: string;
    username: string;
}

export interface IUser {
    _id?: string;
    username: string;
    nickname?: string;
    messageCount: number;
}