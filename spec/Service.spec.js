import { GraphQLBuilder } from '@themost/graphql';
import { getApplication } from '@themost/test';
import { DataCacheStrategy } from '@themost/data';

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
        const app = context.getApplication();
        await context.finalizeAsync();
        const service = app.getConfiguration().getStrategy(DataCacheStrategy);
        if (typeof service.finalize === 'function') {
            await service.finalize();
        }
    })
    it('should create instance', async () => {
        const app = context.getApplication();
        const service = new GraphQLBuilder(app);
        const objectType = await service.getModelType('Thing');
        expect(objectType).toBeTruthy();
    });
});