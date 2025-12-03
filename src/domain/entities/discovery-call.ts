/**
 * Discovery Call - Aggregate Root
 * Represents a code-aware discovery call practice session
 */

import { AggregateRoot } from '../shared/aggregate-root';
import { CompanyId } from '../value-objects/company-id';
import { ProspectPersona } from './prospect-persona';
import { DomainEvent } from '../shared/base-entity';

export interface ConversationMessage {
  role: 'rep' | 'prospect';
  message: string;
  timestamp: Date;
}

export interface ConversationMetrics {
  talkToListenRatio: {
    repSpeakingTime: number;
    prospectSpeakingTime: number;
    totalTime: number;
    ratio: number;
    idealRange: { min: number; max: number };
    status: 'balanced' | 'rep_dominating' | 'rep_too_quiet';
  };
  questions: {
    repQuestions: number;
    prospectQuestions: number;
    discoveryQuestions: number;
    closedQuestions: number;
    questionRatio: number;
  };
  interruptions: {
    repInterrupted: number;
    prospectInterrupted: number;
    interruptionRate: number;
  };
  monologues: {
    repMonologues: number;
    prospectMonologues: number;
    longestRepMonologue: number;
  };
}

export interface DiscoveryCallCreatedEvent extends DomainEvent {
  type: 'discovery_call.created';
  payload: {
    callId: string;
    companyId: string;
    personaId: string;
  };
}

export interface DiscoveryCallCompletedEvent extends DomainEvent {
  type: 'discovery_call.completed';
  payload: {
    callId: string;
    duration: number;
    metrics: ConversationMetrics;
  };
}

export class DiscoveryCall extends AggregateRoot<string> {
  private _companyId: CompanyId;
  private _persona: ProspectPersona;
  private _conversationHistory: ConversationMessage[] = [];
  private _metrics: ConversationMetrics | null = null;
  private _isActive: boolean = true;
  private _startedAt: Date;
  private _completedAt: Date | null = null;
  private _settings: {
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    personality: 'friendly' | 'professional' | 'skeptical' | 'abrasive' | 'hostile';
    salesMethodology: 'GAP' | 'SPIN' | 'MEDDIC' | 'BANT' | null;
  };

  private constructor(
    id: string,
    companyId: CompanyId,
    persona: ProspectPersona,
    settings: DiscoveryCall['_settings'],
    createdAt?: Date
  ) {
    super(id, createdAt);
    this._companyId = companyId;
    this._persona = persona;
    this._settings = settings;
    this._startedAt = createdAt || new Date();
  }

  static create(
    companyId: CompanyId,
    persona: ProspectPersona,
    settings: {
      difficulty: 'easy' | 'medium' | 'hard' | 'expert';
      personality: 'friendly' | 'professional' | 'skeptical' | 'abrasive' | 'hostile';
      salesMethodology?: 'GAP' | 'SPIN' | 'MEDDIC' | 'BANT' | null;
    }
  ): DiscoveryCall {
    const id = `call_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const call = new DiscoveryCall(
      id,
      companyId,
      persona,
      {
        difficulty: settings.difficulty,
        personality: settings.personality,
        salesMethodology: settings.salesMethodology || null,
      }
    );

    call.addDomainEvent({
      type: 'discovery_call.created',
      aggregateId: id,
      occurredOn: new Date(),
      payload: {
        callId: id,
        companyId: companyId.value,
        personaId: persona.id,
      },
    } as DiscoveryCallCreatedEvent);

    return call;
  }

  get companyId(): CompanyId {
    return this._companyId;
  }

  get persona(): ProspectPersona {
    return this._persona;
  }

  get conversationHistory(): readonly ConversationMessage[] {
    return [...this._conversationHistory];
  }

  get metrics(): ConversationMetrics | null {
    return this._metrics;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get settings() {
    return { ...this._settings };
  }

  addMessage(role: 'rep' | 'prospect', message: string): void {
    if (!this._isActive) {
      throw new Error('Cannot add message to completed call');
    }

    this._conversationHistory.push({
      role,
      message,
      timestamp: new Date(),
    });

    this.markAsUpdated();
  }

  updateMetrics(metrics: ConversationMetrics): void {
    this._metrics = metrics;
    this.markAsUpdated();
  }

  complete(): void {
    if (!this._isActive) {
      return;
    }

    this._isActive = false;
    this._completedAt = new Date();
    this.markAsUpdated();

    const duration = this._completedAt.getTime() - this._startedAt.getTime();

    this.addDomainEvent({
      type: 'discovery_call.completed',
      aggregateId: this._id,
      occurredOn: new Date(),
      payload: {
        callId: this._id,
        duration,
        metrics: this._metrics || this.calculateBasicMetrics(),
      },
    } as DiscoveryCallCompletedEvent);
  }

  private calculateBasicMetrics(): ConversationMetrics {
    const repMessages = this._conversationHistory.filter(m => m.role === 'rep');
    const prospectMessages = this._conversationHistory.filter(m => m.role === 'prospect');

    const repTime = repMessages.length * 30; // Estimate 30s per message
    const prospectTime = prospectMessages.length * 30;
    const totalTime = repTime + prospectTime;
    const ratio = totalTime > 0 ? repTime / totalTime : 0;

    return {
      talkToListenRatio: {
        repSpeakingTime: repTime,
        prospectSpeakingTime: prospectTime,
        totalTime,
        ratio,
        idealRange: { min: 0.4, max: 0.6 },
        status: ratio < 0.4 ? 'rep_too_quiet' : ratio > 0.7 ? 'rep_dominating' : 'balanced',
      },
      questions: {
        repQuestions: repMessages.filter(m => m.message.includes('?')).length,
        prospectQuestions: prospectMessages.filter(m => m.message.includes('?')).length,
        discoveryQuestions: 0,
        closedQuestions: 0,
        questionRatio: 0,
      },
      interruptions: {
        repInterrupted: 0,
        prospectInterrupted: 0,
        interruptionRate: 0,
      },
      monologues: {
        repMonologues: 0,
        prospectMonologues: 0,
        longestRepMonologue: 0,
      },
    };
  }
}

