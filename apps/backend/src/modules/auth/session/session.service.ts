import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Session, SessionData } from 'express-session';

// Extend Request with fully typed session
export type SessionRequest = Request & { session: Session & SessionData };

@Injectable()
export class SessionService {
  /**
   * Retrieve the entire session data (excluding methods)
   */
  getSessionData(req: SessionRequest): SessionData {
    // Return a shallow copy to avoid accidental method overwrites
    const { cookie, ...rest } = req.session;
    return { ...rest, cookie };
  }

  /**
   * Store an arbitrary value in session under a string key
   */
  setSessionValue(
    req: SessionRequest,
    key: string,
    value: unknown,
  ): void {
    // Cast session to SessionData so TS allows dynamic keys
    const data = req.session as SessionData;
    data[key] = value;
  }

  /**
   * Destroy the user's session entirely
   */
  destroySession(req: SessionRequest): Promise<void> {
    return new Promise((resolve, reject) => {
      req.session.destroy(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }
}
