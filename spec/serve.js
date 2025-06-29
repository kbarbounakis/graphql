import { serveApplication, getApplication } from '@themost/test';
import { ExpressDataApplication } from '@themost/express';
import { GraphQLBuilder } from '@themost/graphql';
import { createHandler } from 'graphql-http/lib/use/express';
import { GraphQLSchema, GraphQLObjectType, GraphQLList } from 'graphql';
import { ruruHTML } from 'ruru/server';
import camelCase from 'lodash/camelCase';
import pluralize from 'pluralize';

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
                    const name = camelCase(pluralize(currentValue.name));
                    return Object.assign(previousValue, {
                        [name]: {
                            type: new GraphQLList(currentValue),
                            // eslint-disable-next-line no-unused-vars
                            resolve: (source, args, context, info) => {
                                return [];
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