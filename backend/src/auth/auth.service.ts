import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'crypto';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { db } from '../../db';
import { refreshToken, user, userRole } from '../../db/schema';
import { hashPassword, verifyPassword } from '../common/security/password.util';
import { AccessTokenPayload } from './auth.types';
import { UploadCleanupService } from '../upload/upload-cleanup.service';

@Injectable()
export class AuthService {
  private readonly accessTokenTtlSeconds: number;
  private readonly refreshTokenTtlDays: number;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly uploadCleanup: UploadCleanupService,
  ) {
    this.accessTokenTtlSeconds = Number(
      this.configService.get('JWT_ACCESS_TTL_SECONDS') || 900,
    );
    this.refreshTokenTtlDays = Number(
      this.configService.get('REFRESH_TOKEN_TTL_DAYS') || 30,
    );
  }

  async login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const dbUser = await db.query.user.findFirst({
      where: eq(user.email, normalizedEmail),
      with: { roles: true },
    });

    if (
      !dbUser ||
      !dbUser.passwordHash ||
      !dbUser.isActive ||
      !(await verifyPassword(password, dbUser.passwordHash))
    ) {
      throw new UnauthorizedException('Invalid email or password');
    }

    await db
      .update(user)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(user.userId, dbUser.userId));

    return this.createSession(
      dbUser.userId,
      dbUser.email,
      dbUser.roles.map(({ role }) => role),
      this.toPublicUser(dbUser),
    );
  }

  async refreshSession(rawRefreshToken: string) {
    const tokenHash = this.hashToken(rawRefreshToken);
    const storedToken = await db.query.refreshToken.findFirst({
      where: and(
        eq(refreshToken.tokenHash, tokenHash),
        isNull(refreshToken.revokedAt),
        gt(refreshToken.expiresAt, new Date()),
      ),
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const dbUser = await db.query.user.findFirst({
      where: eq(user.userId, storedToken.userId),
      with: { roles: true },
    });

    if (!dbUser?.isActive) {
      throw new UnauthorizedException('User is inactive or no longer exists');
    }

    await db
      .update(refreshToken)
      .set({ revokedAt: new Date() })
      .where(eq(refreshToken.id, storedToken.id));

    return this.createSession(
      dbUser.userId,
      dbUser.email,
      dbUser.roles.map(({ role }) => role),
      this.toPublicUser(dbUser),
    );
  }

  async logout(rawRefreshToken: string) {
    await db
      .update(refreshToken)
      .set({ revokedAt: new Date() })
      .where(eq(refreshToken.tokenHash, this.hashToken(rawRefreshToken)));
  }

  async getUserRoles(userId: string): Promise<string[]> {
    const dbUser = await db.query.user.findFirst({
      where: eq(user.userId, userId),
      with: { roles: true },
    });

    if (!dbUser?.isActive) return [];
    return dbUser.roles.map(({ role }) => role);
  }

  async assignRole(userId: string, role: string) {
    await db.delete(userRole).where(eq(userRole.userId, userId));
    const [newRole] = await db
      .insert(userRole)
      .values({ userId, role })
      .returning();
    return newRole;
  }

  async removeRole(roleId: string) {
    await db.delete(userRole).where(eq(userRole.id, roleId));
  }

  async getUserById(userId: string) {
    const dbUser = await db.query.user.findFirst({
      where: eq(user.userId, userId),
      with: { roles: true },
    });
    return dbUser ? this.toPublicUser(dbUser) : undefined;
  }

  async getUsers() {
    const users = await db.query.user.findMany({ with: { roles: true } });
    return users.map((dbUser) => this.toPublicUser(dbUser));
  }

  async createUser(createUserDto: {
    email: string;
    fullName: string;
    password: string;
  }) {
    const email = createUserDto.email.trim().toLowerCase();
    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, email),
    });

    if (existingUser) throw new ConflictException('Email already exists');

    const [newUser] = await db
      .insert(user)
      .values({
        email,
        fullName: createUserDto.fullName.trim(),
        passwordHash: await hashPassword(createUserDto.password),
        emailVerified: true,
        isActive: true,
      })
      .returning();

    await db.insert(userRole).values({
      userId: newUser.userId,
      role: 'student',
    });

    return { user: { ...this.toPublicUser(newUser), roles: ['student'] } };
  }

  async updateUser(
    userId: string,
    updateUserDto: {
      fullName?: string;
      isActive?: boolean;
      avatarUrl?: string;
      password?: string;
    },
  ) {
    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.userId, userId));
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (updateUserDto.fullName !== undefined)
      updates.fullName = updateUserDto.fullName.trim();
    if (updateUserDto.isActive !== undefined)
      updates.isActive = updateUserDto.isActive;
    if (updateUserDto.avatarUrl !== undefined)
      updates.avatarUrl = updateUserDto.avatarUrl;
    if (updateUserDto.password)
      updates.passwordHash = await hashPassword(updateUserDto.password);

    const [updatedUser] = await db
      .update(user)
      .set(updates)
      .where(eq(user.userId, userId))
      .returning();

    if (!updatedUser) throw new UnauthorizedException('User not found');
    await this.uploadCleanup.cleanupReplaced(existingUser, updatedUser);
    return updatedUser;
  }

  async deleteUser(userId: string) {
    const [deletedUser] = await db
      .delete(user)
      .where(eq(user.userId, userId))
      .returning();
    if (deletedUser) await this.uploadCleanup.cleanupDeleted(deletedUser);
  }

  private async createSession(
    userId: string,
    email: string,
    roles: string[],
    publicUser: Record<string, unknown>,
  ) {
    const payload: AccessTokenPayload = {
      sub: userId,
      email,
      roles,
      type: 'access',
    };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.accessTokenTtlSeconds,
    });
    const rawRefreshToken = randomBytes(32).toString('base64url');
    const expiresAt = new Date(
      Date.now() + this.refreshTokenTtlDays * 24 * 60 * 60 * 1000,
    );

    await db.insert(refreshToken).values({
      userId,
      tokenHash: this.hashToken(rawRefreshToken),
      expiresAt,
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      expiresIn: this.accessTokenTtlSeconds,
      user: publicUser,
    };
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private toPublicUser(
    dbUser: typeof user.$inferSelect & { roles?: { role: string }[] },
  ) {
    const { passwordHash, ...safeUser } = dbUser;
    return {
      ...safeUser,
      roles: Array.isArray(dbUser.roles)
        ? dbUser.roles.map(({ role }) => role)
        : undefined,
    };
  }
}
