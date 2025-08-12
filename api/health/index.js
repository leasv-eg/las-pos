module.exports = async function (context, req) {
    context.log('Health check endpoint called');
    
    context.res = {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: '1.1',
            proxy: 'updated'
        })
    };
};
