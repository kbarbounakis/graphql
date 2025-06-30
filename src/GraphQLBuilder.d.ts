import { ApplicationService } from '@themost/common';
import { GraphQLObjectType } from 'graphql';

export declare class GraphQLBuilder extends ApplicationService {
    constructor(app: ApplicationBase);
    getObjectType(name: string): Promise<GraphQLObjectType>;
    getObjectTypes(): Promise<GraphQLObjectType[]>;
    getEntitySet(objectType: GraphQLObjectType): string;
    getEntityType(objectType: GraphQLObjectType): string;
}

export declare interface GraphQLObjectTypeExtensions {
    [key: string]: any;
    '@themost.entitySet'?: string;
    '@themost.entityType'?: string;
}