/**
 * Query Handler Interface
 * CQRS Query Handler pattern
 */

export interface QueryHandler<TQuery, TResult> {
  handle(query: TQuery): Promise<TResult>;
}

