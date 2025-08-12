const fetch = require('node-fetch');

module.exports = async function (context, req) {
    // Set CORS headers
    context.res.headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Content-Type': 'application/json'
    };

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        context.res = {
            status: 200,
            headers: context.res.headers,
            body: ''
        };
        return;
    }

    try {
        // Get the path from the route parameter
        const path = context.req.params.path || '';
        
        // Determine the target environment based on query parameter or default to prod
        const environment = req.query.env || 'prod';
        
        // Environment URLs
        const environments = {
            dev: 'https://posapi.egretail-dev.cloud/api',
            test: 'https://posapi.egretail-test.cloud/api', 
            prod: 'https://posapi.egretail.cloud/api'
        };
        
        const baseUrl = environments[environment] || environments.prod;
        const targetUrl = `${baseUrl}/${path}`;

        context.log(`[POS Proxy v1.1] ${req.method} ${targetUrl}`);
        context.log(`[POS Proxy] Request headers:`, req.headers);
        context.log(`[POS Proxy] Request body:`, req.body);

        // Build headers for forwarding - ensure we get the authorization header correctly
        const forwardHeaders = {
            'Content-Type': 'application/json',
            'User-Agent': 'LAS-POS-Azure-Proxy/1.0'
        };

        // Add authorization header if present (check both cases)
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (authHeader) {
            forwardHeaders['Authorization'] = authHeader;
            context.log(`[POS Proxy] Found authorization header: ${authHeader.substring(0, 20)}...`);
        } else {
            context.log(`[POS Proxy] No authorization header found in request`);
        }

        // Forward the request to the POS API
        const response = await fetch(targetUrl, {
            method: req.method,
            headers: forwardHeaders,
            body: req.method !== 'GET' && req.body ? JSON.stringify(req.body) : undefined
        });

        const responseData = await response.text();
        
        context.log(`[POS Proxy] Response status: ${response.status}`);
        if (response.status === 401) {
            context.log(`[POS Proxy] 401 Unauthorized - Auth header was: ${authHeader ? authHeader.substring(0, 20) + '...' : 'MISSING'}`);
        }
        context.log(`[POS Proxy] Response headers:`, Object.fromEntries(response.headers.entries()));
        context.log(`[POS Proxy] Response body:`, responseData);

        // Return the response
        context.res = {
            status: response.status,
            headers: {
                ...context.res.headers,
                'Content-Type': response.headers.get('content-type') || 'application/json'
            },
            body: responseData
        };

    } catch (error) {
        context.log.error('[POS Proxy] Error:', error);
        
        context.res = {
            status: 500,
            headers: context.res.headers,
            body: JSON.stringify({
                error: 'Proxy error',
                message: error.message,
                timestamp: new Date().toISOString()
            })
        };
    }
};
