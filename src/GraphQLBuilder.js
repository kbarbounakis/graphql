import {ApplicationService} from '@themost/common';
import {EdmType, ODataConventionModelBuilder, ODataModelBuilder} from '@themost/data';
import {GraphQLBoolean, GraphQLFloat, GraphQLInt, GraphQLObjectType, GraphQLString} from 'graphql';

const EdmTypeGraphQLType = [
    [ EdmType.EdmBoolean, GraphQLBoolean ],
    [ EdmType.EdmByte, GraphQLInt ],
    [ EdmType.EdmDate, GraphQLString ],
    [ EdmType.EdmDateTimeOffset, GraphQLString ],
    [ EdmType.EdmDecimal, GraphQLFloat ],
    [ EdmType.EdmDouble, GraphQLFloat ],
    [ EdmType.EdmDuration, GraphQLString ],
    [ EdmType.EdmGuid, GraphQLString ],
    [ EdmType.EdmInt16, GraphQLInt ],
    [ EdmType.EdmInt32, GraphQLInt ],
    [ EdmType.EdmInt64, GraphQLInt ],
    [ EdmType.EdmSByte, GraphQLInt ],
    [ EdmType.EdmSingle, GraphQLInt ],
    [ EdmType.EdmString, GraphQLString ],
    [ EdmType.EdmBinary, GraphQLString ],
    [ EdmType.EdmStream, GraphQLString ],
]

const GraphQLBuilderExtensions = {
    '@themost.entityType': {
        type: GraphQLString,
        description: 'The name of the entity type'
    },
    '@themost.entitySet': {
        type: GraphQLString,
        description: 'The name of the entity set'
    }

}

class GraphQLBuilder extends ApplicationService {

    /**
     * @type {import('@themost/data').ODataModelBuilder}
     */
    builder;

    constructor(app) {
        super(app);
        this.builder = app.getConfiguration().getStrategy(ODataModelBuilder);
        if (this.builder == null) {
            this.builder = new ODataConventionModelBuilder(app.getConfiguration());
        }
    }

    /**
     * @param {string} name
     */
    async getObjectType(name) {
        await this.builder.getEdm();
        const entityType = this.builder.getEntity(name);
        if (entityType == null) {
            throw new Error(`Entity type '${name}' not found`);
        }
        return this.entityTypeToGraphQLTypeConfig(entityType);
    }

    /**
     *
     * @param {import('@themost/data').EntityTypeConfiguration} entityType
     * @returns {import('graphql').GraphQLObjectTypeConfig}
     */
    entityTypeToGraphQLTypeConfig(entityType) {
        const { name, property } = entityType;
        const fields = property.map((prop) => {
            let mapType = EdmTypeGraphQLType.find(([type]) => type === prop.type);
            if (mapType == null) {
                mapType = [ EdmType.EdmBinary, GraphQLString ]
            }
            const [,type] = mapType;
            return {
                [prop.name]: {
                    type
                }
            }
        }).reduce((acc, curr) => {
            return Object.assign(acc, curr);
        }, {});
        const extensions = {
            '@themost.entityType': name
        }
        return {
            name,
            fields,
            extensions
        };
    }

    /**
     *
     * @param {import('graphql').GraphQLObjectType} objectType
     * @returns {string}
     */
    getEntityType(objectType) {
        if (objectType.extensions && objectType.extensions['@themost.entityType']) {
            return objectType.extensions['@themost.entityType'];
        }
        throw new Error('Entity type not found in object type extensions');
    }

    /**
     *
     * @param {import('graphql').GraphQLObjectType} objectType
     * @returns {string}
     */
    getEntitySet(objectType) {
        if (objectType.extensions && objectType.extensions['@themost.entitySet']) {
            return objectType.extensions['@themost.entitySet'];
        }
        throw new Error('Entity set not found in object type extensions');
    }

    /**
     * @returns {Promise<Array<GraphQLObjectType>>}
     */
    async getObjectTypes() {
        /**
         *
         * @type {Array<import('graphql').GraphQLObjectTypeConfig>}
         */
        const objectTypeConfigs = [];
        // get schema
        const schema = await this.builder.getEdm();
        for (const entitySet of schema.entityContainer.entitySet) {
            // get model type
            const objectTypeConfig = this.entityTypeToGraphQLTypeConfig(entitySet.entityType);
            let baseTypeDescriptor = Object.getOwnPropertyDescriptor(entitySet.entityType, 'baseType');
            while (baseTypeDescriptor) {
                const baseEntityType = this.builder.getEntity(baseTypeDescriptor.value)
                const baseObjectTypeConfig = this.entityTypeToGraphQLTypeConfig(baseEntityType);
                objectTypeConfig.fields = Object.assign({}, baseObjectTypeConfig.fields, objectTypeConfig.fields);
                baseTypeDescriptor = Object.getOwnPropertyDescriptor(baseEntityType, 'baseType');
            }
            Object.assign(objectTypeConfig.extensions, {
                '@themost.entitySet': entitySet.name
            });
            objectTypeConfigs.push(objectTypeConfig);
        }
        return objectTypeConfigs.map((config) => {
            return new GraphQLObjectType(config);
        });
    }

}

export {
    GraphQLBuilderExtensions,
    GraphQLBuilder
}