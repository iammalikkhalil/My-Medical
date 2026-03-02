import { Types } from "mongoose";

export function toObjectId(value: string) {
  return new Types.ObjectId(value);
}

export function isObjectId(value: string) {
  return Types.ObjectId.isValid(value);
}

