import { TokenPayload } from "../@shared/utils/jwt";

declare global {
  namespace Express {
    export interface Request {
      user?: TokenPayload;
    }
  }
}