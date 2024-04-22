import { ApplicationService } from '@themost/common';
import { ODataModelBuilder, ODataConventionModelBuilder, EdmType } from '@themost/data';
import { GraphQLBoolean, GraphQLInt, GraphQLString, GraphQLFloat, GraphQLObjectType} from 'graphql';

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
            this.builder.read
        }
    }

    /**
     * @param {string} model 
     */
    async getModelType(model) {
        await this.builder.getEdm();
        const entityType = this.builder.getEntity(model);
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
        })
        const objectType = new GraphQLObjectType({
            name,
            fields
          })
        return objectType;
    }

}

export {
    GraphQLBuilder
}