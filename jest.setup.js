const { TraceUtils } = require('@themost/common');
const { JsonLogger } = require('@themost/json-logger');
require('dotenv').config();
// use json logger
TraceUtils.useLogger(new JsonLogger());

