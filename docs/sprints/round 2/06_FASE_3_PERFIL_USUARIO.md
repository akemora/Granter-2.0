# FASE 3 - PER-USER PROFILE (NOT GLOBAL)

Status: DONE
Start date: 2026-01-29
End date: 2026-01-29

---

## Mandatory Reference

- [AGENTS.md](../../../AGENTS.md)
- **MCP Assignment:** Sonnet (complex logic)

---

## Objective

Eliminate the single global profile. Create profiles associated with each user and personalize recommendations/notifications.

---

## Dependencies

- FASE 2 complete (data model ready)

---

## Related Gaps

- PRF-01, PRF-02, PRF-03, PRF-04, PRF-05, INT-03

---

## Current State Analysis

```typescript
// profile.service.ts - CURRENT (problematic)
const PROFILE_ID = 'default-profile';  // Single global profile

async getProfile(): Promise<UserProfileEntity> {
  const profile = await this.profileRepository.findOne({ where: { id: PROFILE_ID } });
  return profile ?? this.defaultProfile();
}
```

---

## Checklist

### Database Migration

1. [x] **[P1][M]** Create migration: `20260129002000-AddUserIdToProfiles.ts`
   ```typescript
   // UP:
   ALTER TABLE user_profiles ADD COLUMN user_id UUID;
   ALTER TABLE user_profiles ADD CONSTRAINT fk_profiles_user
     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
   CREATE UNIQUE INDEX idx_profiles_user ON user_profiles(user_id);
   -- NOTE: We are NOT migrating the old 'default-profile'.
   -- The new ProfileService logic will create a default profile for each user
   -- the first time they access it, which is a safer "lazy migration" approach.
   -- The old 'default-profile' row will become orphaned and can be deleted manually.

   // DOWN:
   DROP INDEX idx_profiles_user;
   ALTER TABLE user_profiles DROP CONSTRAINT fk_profiles_user;
   ALTER TABLE user_profiles DROP COLUMN user_id;
   ```
   - **Acceptance:** Migration runs without errors. The schema is updated.

### Entity Updates

2. [x] **[P1][M]** Update UserProfileEntity:
   ```typescript
   @Entity('user_profiles')
   export class UserProfileEntity {
     @PrimaryGeneratedColumn('uuid')  // Changed from PrimaryColumn
     id!: string;

     @Column({ name: 'user_id' })
     userId!: string;

     @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
     @JoinColumn({ name: 'user_id' })
     user!: UserEntity;

     // ... rest of fields unchanged
   }
   ```
   - **Acceptance:** Entity compiles, FK constraint works.

3. [x] **[P1][S]** Update UserEntity with profile relation:
   ```typescript
   @OneToOne(() => UserProfileEntity, profile => profile.user)
   profile?: UserProfileEntity;
   ```
   - **Acceptance:** User can load profile via relation.

### Service Updates

4. [x] **[P1][M]** Update ProfileService to receive userId:
   ```typescript
   async getProfile(userId: string): Promise<UserProfileEntity> {
     let profile = await this.profileRepository.findOne({ where: { userId } });
     if (!profile) {
       profile = await this.createDefaultProfile(userId);
     }
     return profile;
   }

   async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserProfileEntity> {
     const profile = await this.getProfile(userId);
     // ... merge and save
   }

   private async createDefaultProfile(userId: string): Promise<UserProfileEntity> {
     const profile = this.profileRepository.create({
       userId,
       keywords: [],
       regions: [],
       // ... defaults
     });
     return this.profileRepository.save(profile);
   }
   ```
   - **Acceptance:** Profile CRUD works with userId.

5. [x] **[P1][S]** Remove `PROFILE_ID = 'default-profile'` constant.
   - **Acceptance:** No reference to global profile ID.

### Controller Updates

6. [x] **[P1][M]** Update ProfileController to extract userId from JWT:
   ```typescript
   @UseGuards(JwtAuthGuard)
   @Get()
   getProfile(@Request() req): Promise<UserProfileEntity> {
     return this.profileService.getProfile(req.user.id);
   }

   @UseGuards(JwtAuthGuard)
   @Put()
   updateProfile(@Request() req, @Body() dto: UpdateProfileDto): Promise<UserProfileEntity> {
     return this.profileService.updateProfile(req.user.id, dto);
   }
   ```
   - **Acceptance:** Profile endpoints require auth and use correct user.

### Recommendations Update

7. [x] **[P1][M]** Update RecommendationsService to receive userId:
   ```typescript
   async getRecommendations(userId: string, limit: number = 10): Promise<RecommendationDto[]> {
     const profile = await this.profileService.getProfile(userId);
     // ... existing logic
   }
   ```
   - **Acceptance:** Recommendations are user-specific.

8. [x] **[P1][S]** Update RecommendationsController to pass userId.
   - **Acceptance:** Controller extracts user from JWT.

### Notifications Update

9. [x] **[P1][M]** Update NotificationsService.notifyForNewGrants to be user-aware:
   ```typescript
   async notifyForNewGrants(grants: GrantEntity[]): Promise<NotificationSummary> {
     // Get all active profiles with notifications enabled
     const profiles = await this.profileRepository.find({
       where: [
         { emailNotifications: true },
         { telegramNotifications: true },
       ],
     });

     for (const profile of profiles) {
       const ranked = this.recommendationsService.rankGrants(grants, profile);
       // ... send notifications per user
     }
   }
   ```
   - **Acceptance:** Each user gets their own notifications.

### Frontend Update

10. [x] **[P2][M]** Update frontend settings page to work with per-user profile:
    - Ensure auth token is sent with profile requests
    - Handle 401 errors
    - **Acceptance:** Settings page loads/saves user-specific profile.

### Testing

11. [x] **[P1][M]** Update/create tests:
    - `profile.service.spec.ts` - test with userId
    - `recommendations.service.spec.ts` - test with userId
    - **Acceptance:** Tests verify two users have different profiles.

---

## Validation

- [x] Tests pass: `npm run test`.
- [x] Two different users see different profiles.
- [x] Recommendations are personalized per user.
- [x] Notifications respect each user's settings.
- [x] Frontend settings work with real user.

---

## Files Likely to Change

- `apps/backend-core/src/database/entities/user-profile.entity.ts`
- `apps/backend-core/src/database/entities/user.entity.ts`
- `apps/backend-core/src/database/migrations/`
- `apps/backend-core/src/profile/profile.service.ts`
- `apps/backend-core/src/profile/profile.controller.ts`
- `apps/backend-core/src/recommendations/recommendations.service.ts`
- `apps/backend-core/src/recommendations/recommendations.controller.ts`
- `apps/backend-core/src/notifications/notifications.service.ts`
- `apps/web-frontend/src/app/settings/page.tsx`

---

## Blockers

- None

---
