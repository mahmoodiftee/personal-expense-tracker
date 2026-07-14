import type { User, UserPreferences } from '@finance/shared';

/** DI token used to bind the concrete implementation in the module. */
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface CreateUserData {
  readonly email: string;
  readonly passwordHash: string;
  readonly displayName: string;
  readonly baseCurrency: User['baseCurrency'];
  readonly preferences?: Partial<UserPreferences>;
}

export interface UpdateUserData {
  readonly displayName?: string;
  readonly baseCurrency?: User['baseCurrency'];
  readonly preferences?: Partial<UserPreferences>;
}

/** Auth flows need the hash; kept out of the public {@link User} read model. */
export interface UserWithSecret extends User {
  readonly passwordHash: string;
}

/**
 * Persistence contract for the User aggregate. Note the deliberate absence of a
 * generic tenant scope here: the user *is* the tenant root.
 */
export interface UserRepositoryPort {
  create(data: CreateUserData): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  /** Includes `passwordHash` for authentication only. */
  findByEmailWithSecret(email: string): Promise<UserWithSecret | null>;
  update(id: string, changes: UpdateUserData): Promise<User | null>;
  delete(id: string): Promise<boolean>;
}
