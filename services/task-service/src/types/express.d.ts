export {}

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      userId: number;
      organizationId: number;
      role: string;
    };
  }
}
