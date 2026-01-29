import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import nodemailer, { Transporter } from 'nodemailer';
import {
  GrantNotificationEntity,
  NotificationChannel,
  NotificationStatus,
} from '../database/entities/grant-notification.entity';
import { GrantEntity } from '../database/entities/grant.entity';
import { UserProfileEntity } from '../database/entities/user-profile.entity';
import { RecommendationsService } from '../recommendations/recommendations.service';

interface NotificationSummary {
  processed: number;
  sent: number;
  failed: number;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private mailer: Transporter | null = null;

  constructor(
    @InjectRepository(GrantNotificationEntity)
    private readonly notificationsRepository: Repository<GrantNotificationEntity>,
    @InjectRepository(UserProfileEntity)
    private readonly profileRepository: Repository<UserProfileEntity>,
    private readonly recommendationsService: RecommendationsService,
  ) {}

  async notifyForNewGrants(grants: GrantEntity[]): Promise<NotificationSummary> {
    if (grants.length === 0) {
      return { processed: 0, sent: 0, failed: 0 };
    }

    const limit = this.getMaxPerRun();
    const profiles = await this.profileRepository.find({
      where: [{ emailNotifications: true }, { telegramNotifications: true }],
    });

    if (profiles.length === 0) {
      return { processed: 0, sent: 0, failed: 0 };
    }

    const summary: NotificationSummary = { processed: 0, sent: 0, failed: 0 };
    for (const profile of profiles) {
      const ranked = this.recommendationsService.rankGrants(grants, profile);
      const limited = ranked.slice(0, limit);

      summary.processed += limited.length;
      for (const item of limited) {
        const result = await this.sendForGrant(item.grant, profile, item.matchedKeywords, item.score);
        summary.sent += result.sent;
        summary.failed += result.failed;
      }
    }

    return summary;
  }

  async getRecent(limit: number = 20): Promise<GrantNotificationEntity[]> {
    return this.notificationsRepository.find({
      relations: ['grant'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getRecentForUser(userId: string, limit: number = 20): Promise<GrantNotificationEntity[]> {
    const profile = await this.profileRepository.findOne({ where: { userId } });
    if (!profile) {
      return [];
    }

    const recipients = [profile.email, profile.telegramChatId].filter((value): value is string => Boolean(value));
    if (recipients.length === 0) {
      return [];
    }

    return this.notificationsRepository.find({
      where: { recipient: In(recipients) },
      relations: ['grant'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  private async sendForGrant(grant: GrantEntity, profile: UserProfileEntity, matchedKeywords: string[], score: number) {
    const email = profile.emailNotifications ? (profile.email ?? undefined) : undefined;
    const chatId = profile.telegramNotifications ? (profile.telegramChatId ?? undefined) : undefined;
    const emailResult = await this.sendEmailIfEnabled(grant, email, matchedKeywords, score);
    const telegramResult = await this.sendTelegramIfEnabled(grant, chatId, matchedKeywords, score);
    return {
      sent: emailResult.sent + telegramResult.sent,
      failed: emailResult.failed + telegramResult.failed,
    };
  }

  private async sendEmailIfEnabled(
    grant: GrantEntity,
    email?: string,
    matchedKeywords: string[] = [],
    score: number = 0,
  ) {
    if (!this.canSendEmail(email)) {
      return { sent: 0, failed: 0 };
    }
    const alreadySent = await this.hasSentNotification(grant.id, NotificationChannel.Email, email);
    if (alreadySent) {
      return { sent: 0, failed: 0 };
    }
    return this.executeEmailSend(grant, email, matchedKeywords, score);
  }

  private async sendTelegramIfEnabled(
    grant: GrantEntity,
    chatId?: string,
    matchedKeywords: string[] = [],
    score: number = 0,
  ) {
    if (!this.canSendTelegram(chatId)) {
      return { sent: 0, failed: 0 };
    }
    const alreadySent = await this.hasSentNotification(grant.id, NotificationChannel.Telegram, chatId);
    if (alreadySent) {
      return { sent: 0, failed: 0 };
    }
    return this.executeTelegramSend(grant, chatId, matchedKeywords, score);
  }

  private async sendTelegramMessage(chatId: string, text: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return;

    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(body || `Telegram request failed with ${response.status}`);
    }
  }

  private canSendEmail(email?: string): email is string {
    return Boolean(email && this.isEmailEnabled());
  }

  private canSendTelegram(chatId?: string): chatId is string {
    return Boolean(chatId && this.isTelegramEnabled());
  }

  private async executeEmailSend(grant: GrantEntity, email: string, matchedKeywords: string[], score: number) {
    const transport = this.getMailer();
    if (!transport) return { sent: 0, failed: 0 };

    try {
      await transport.sendMail(this.buildEmailPayload(grant, email, matchedKeywords, score));
      await this.recordNotification(grant.id, NotificationChannel.Email, email, NotificationStatus.Sent, null, {
        score,
        matchedKeywords,
      });
      return { sent: 1, failed: 0 };
    } catch (error) {
      const message = this.getErrorMessage(error);
      await this.recordNotification(grant.id, NotificationChannel.Email, email, NotificationStatus.Failed, message, {
        score,
        matchedKeywords,
      });
      this.logger.error(`Email notification failed for ${grant.id}: ${message}`);
      return { sent: 0, failed: 1 };
    }
  }

  private async executeTelegramSend(grant: GrantEntity, chatId: string, matchedKeywords: string[], score: number) {
    try {
      await this.sendTelegramMessage(chatId, this.buildTelegramText(grant, matchedKeywords, score));
      await this.recordNotification(grant.id, NotificationChannel.Telegram, chatId, NotificationStatus.Sent, null, {
        score,
        matchedKeywords,
      });
      return { sent: 1, failed: 0 };
    } catch (error) {
      const message = this.getErrorMessage(error);
      await this.recordNotification(
        grant.id,
        NotificationChannel.Telegram,
        chatId,
        NotificationStatus.Failed,
        message,
        {
          score,
          matchedKeywords,
        },
      );
      this.logger.error(`Telegram notification failed for ${grant.id}: ${message}`);
      return { sent: 0, failed: 1 };
    }
  }

  private async hasSentNotification(grantId: string, channel: NotificationChannel, recipient: string) {
    const existing = await this.notificationsRepository.findOne({
      where: { grantId, channel, recipient, status: NotificationStatus.Sent },
    });
    return Boolean(existing);
  }

  private async recordNotification(
    grantId: string,
    channel: NotificationChannel,
    recipient: string,
    status: NotificationStatus,
    error?: string | null,
    meta?: Record<string, unknown>,
  ) {
    const notification = this.notificationsRepository.create({
      grantId,
      channel,
      recipient,
      status,
      error: error ?? null,
      meta: meta ?? null,
      sentAt: status === NotificationStatus.Sent ? new Date() : null,
    });
    await this.notificationsRepository.save(notification);
  }

  private buildEmailPayload(grant: GrantEntity, email: string, matchedKeywords: string[], score: number) {
    return {
      from: this.getEmailFrom(),
      to: email,
      subject: `Nueva subvencion: ${grant.title}`,
      text: this.buildPlainText(grant, matchedKeywords, score),
      html: this.buildHtml(grant, matchedKeywords, score),
    };
  }

  private getMailer(): Transporter | null {
    if (this.mailer) return this.mailer;
    if (!this.isEmailEnabled()) return null;

    this.mailer = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT ?? 587),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    return this.mailer;
  }

  private isEmailEnabled(): boolean {
    return Boolean(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);
  }

  private isTelegramEnabled(): boolean {
    return Boolean(process.env.TELEGRAM_BOT_TOKEN);
  }

  private getEmailFrom(): string {
    return process.env.EMAIL_FROM ?? process.env.EMAIL_USER ?? 'no-reply@granter.local';
  }

  private getMaxPerRun(): number {
    const parsed = Number(process.env.NOTIFICATIONS_MAX_PER_RUN ?? 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 10;
  }

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  private buildPlainText(grant: GrantEntity, matchedKeywords: string[], score: number): string {
    const lines = [
      `Nueva subvencion detectada: ${grant.title}`,
      `Region: ${grant.region}`,
      `Importe: ${grant.amount ?? 'No especificado'}`,
      `Plazo: ${grant.deadline ?? 'Abierta'}`,
      matchedKeywords.length > 0 ? `Keywords: ${matchedKeywords.join(', ')}` : 'Keywords: sin coincidencias',
      `Score: ${score}`,
      grant.officialUrl ? `Portal: ${grant.officialUrl}` : '',
      '',
      grant.description,
    ];
    return lines.filter((line) => line !== '').join('\n');
  }

  private buildHtml(grant: GrantEntity, matchedKeywords: string[], score: number): string {
    return `
      <h2>Nueva subvencion detectada</h2>
      <p><strong>${grant.title}</strong></p>
      <p>Region: ${grant.region}</p>
      <p>Importe: ${grant.amount ?? 'No especificado'}</p>
      <p>Plazo: ${grant.deadline ?? 'Abierta'}</p>
      <p>Score: ${score}</p>
      <p>Keywords: ${matchedKeywords.length > 0 ? matchedKeywords.join(', ') : 'sin coincidencias'}</p>
      ${grant.officialUrl ? `<p>Portal: <a href="${grant.officialUrl}">${grant.officialUrl}</a></p>` : ''}
      <p>${grant.description}</p>
    `;
  }

  private buildTelegramText(grant: GrantEntity, matchedKeywords: string[], score: number): string {
    const parts = [
      `Nueva subvencion: ${grant.title}`,
      `Region: ${grant.region}`,
      `Importe: ${grant.amount ?? 'No especificado'}`,
      `Plazo: ${grant.deadline ?? 'Abierta'}`,
      `Score: ${score}`,
    ];
    if (matchedKeywords.length > 0) {
      parts.push(`Keywords: ${matchedKeywords.join(', ')}`);
    }
    if (grant.officialUrl) {
      parts.push(`Portal: ${grant.officialUrl}`);
    }
    return parts.join('\n');
  }
}
