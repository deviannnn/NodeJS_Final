const devConStr = process.env.DB_DEV_CONSTRING;
const prodConStr = process.env.DB_PROD_CONSTRING;

module.exports = {
    development: {
        connectionString: devConStr
    },
    production: {
        connectionString: prodConStr
    }
};