import { ArticleContext } from './context';
import { contextManager } from '../../../core/context';

contextManager.pushContext(ArticleContext);

export * from './controller';
