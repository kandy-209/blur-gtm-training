/**
 * Command Handler Interface
 * CQRS Command Handler pattern
 */

export interface CommandHandler<TCommand, TResult> {
  handle(command: TCommand): Promise<TResult>;
}

