/* eslint-disable prettier/prettier */
import { Roles } from "../common/Roles.enum";

export interface JwtPayload {
  id: number;
  username:string
  email: string;
  role: Roles[];
}
