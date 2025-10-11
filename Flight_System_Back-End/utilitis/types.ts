import { Types } from "mongoose";

export type JWTPayloadType={
    id: Types.ObjectId;
    userType:string;
}

export type AccessTokenType={
    accessToken: string;
}
export type Ids ={
    paymentId:string,
    payerId:string,
    orderId:Types.ObjectId
}