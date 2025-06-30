import { serveApplication, getApplication } from '@themost/test';
import { ExpressDataApplication } from '@themost/express';
import { GraphQLBuilder } from '@themost/graphql';
import { createHandler } from 'graphql-http/lib/use/express';
import { GraphQLSchema, GraphQLObjectType, GraphQLList } from 'graphql';
import { ruruHTML } from 'ruru/server';
import camelCase from 'lodash/camelCase';

(async function main() {
    /**
     * @type {import('express').Application|*}
     */
    const container = getApplication();
    /**
     * @type {import('@themost/express').ExpressDataApplication}
     */
    const app = container.get(ExpressDataApplication.name);
    app.useService(GraphQLBuilder);
    app.serviceRouter.subscribe((serviceRouter) => {
        if (serviceRouter == null) {
            return;
        }
        /**
         * @type {import('@themost/graphql').GraphQLBuilder}
         */
        const service = app.getService(GraphQLBuilder);
            service.getObjectTypes().then((objectTypes) => {
                const fields = objectTypes.reduce((previousValue, currentValue) => {
                    /**
                     * @type {import('@themost/graphql').GraphQLObjectTypeExtensions}
                     */
                    const extensions = currentValue.extensions;
                    const entitySet = extensions['@themost.entitySet'];
                    const name = camelCase(entitySet);
                    return Object.assign(previousValue, {
                        [name]: {
                            type: new GraphQLList(currentValue),
                            /**
                             * @param source
                             * @param args
                             * @param {import('@themost/express').ExpressDataContext} context
                             * @param info
                             * @returns {Promise<Array<*>>}
                             */
                            resolve: (source, args, context, info) => {
                                const { returnType } = info;
                                if (returnType instanceof GraphQLList) {
                                    const { ofType } = returnType;
                                    const entityType = service.getEntityType(ofType);
                                    const requestedFields = info.fieldNodes[0].selectionSet.selections.map(
                                        field => field.name.value
                                    );
                                    return context.model(entityType).asQueryable().getItems();
                                }
                                throw new Error('Expected a list type');
                            }
                        }
                    });
                }, {});
            const name = 'RootQuery';
            const RootQuery = new GraphQLObjectType({
                name,
                fields
            });

            const schema = new GraphQLSchema({
                query: RootQuery,
            });

            serviceRouter.use(
                '/graphql',
                createHandler({
                    schema,
                    // eslint-disable-next-line no-unused-vars
                    context: (req, _res) => {
                        // noinspection JSUnresolvedReference
                        return req.raw.context;
                    }
                }),
            );
            serviceRouter.get('/graphql-explorer', (_req, res) => {
                res.type('html');
                res.end(ruruHTML({ endpoint: '/api/graphql' }));
            });
        });


    });

    await serveApplication(container, process.env.PORT || 3000);
})();