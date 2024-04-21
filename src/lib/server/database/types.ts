import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type AppUser = {
    id: string;
    name: string;
    /**
     * @kyselyType('admin' | 'member')
     */
    role: 'admin' | 'member';
};
export type Key = {
    id: Generated<string>;
    userId: string;
    provider: string;
    sub: string;
};
export type Session = {
    id: string;
    userId: string;
    expiresAt: Timestamp;
    loginMethod: string | null;
};
export type DB = {
    appUser: AppUser;
    key: Key;
    session: Session;
};
