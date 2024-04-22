import { ApplicationService } from '@themost/common';
import { GraphQLObjectType } from 'graphql';

export declare class GraphQLBuilder extends ApplicationService {
    constructor(app: ApplicationBase);
    getModelType(model: string): Promise<GraphQLObjectType>;
}