export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
}

export enum UserPermission {
    READ = 'read',
    READ_WRITE = 'readWrite',
}

export interface UserProfile {
    uid: string;
    name: string;
    email: string;
    permission: UserPermission;
    role: UserRole;
    disabled: boolean;
    deleted: boolean;
}
