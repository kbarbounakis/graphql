import { GraphQLBuilder } from '@themost/graphql';
import { getApplication } from '@themost/test';
import { DataCacheStrategy } from '@themost/data';
import {GraphQLList, GraphQLObjectType, GraphQLSchema} from 'graphql';

describe('GraphQLService', () => {
    /**
     * @type {import('@themost/data').DataContext}
     */
    let context;
    beforeAll(() => {
        const container = getApplication();
        /**
         * @type {import('@themost/express').ExpressDataApplication}
         */
        const app = container.get('ExpressDataApplication');
        context = app.createContext();
    });
    afterAll(async () => {
        const app = context.application;
        await context.finalizeAsync();
        const service = app.getConfiguration().getStrategy(DataCacheStrategy);
        if (typeof service.finalize === 'function') {
            await service.finalize();
        }
    })
    it('should create instance', async () => {
        const app = context.application;
        const service = new GraphQLBuilder(app);
        const objectType = await service.getModelType('Thing');
        expect(objectType).toBeTruthy();
    });

    it('should get object types', async () => {
        const service = new GraphQLBuilder(context.application);
        const objectTypes = await service.getObjectTypes();
        expect(objectTypes).toBeTruthy();
    });

    it('should create schema', async () => {
        const service = new GraphQLBuilder(context.application);
        const UserType = await service.getModelType('User');
        expect(UserType).toBeTruthy();

        const RootQuery = new GraphQLObjectType({
            name: 'RootQuery',
            fields: {
                users: {
                    type: new GraphQLList(UserType),
                    resolve: (context) => {
                        return context.model('User').getItems();
                    }
                }
            }
        });

        const schema = new GraphQLSchema({
            query: RootQuery,
        });
        expect(schema).toBeTruthy();
    });
});