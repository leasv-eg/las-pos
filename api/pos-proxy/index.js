const https = require('https');
const { URL } = require('url');

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
        // IMPORTANT: Azure Functions may override the Authorization header, so we need to preserve the original
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (authHeader) {
            // Store original auth header to preserve it from Azure Functions override
            const originalAuth = authHeader;
            forwardHeaders['Authorization'] = originalAuth;
            context.log(`[POS Proxy] Found authorization header: ${authHeader.substring(0, 20)}...`);
            context.log(`[POS Proxy] Full header length: ${authHeader.length}`);
            context.log(`[POS Proxy] Preserving original auth: ${originalAuth === authHeader ? 'YES' : 'NO'}`);
        } else {
            context.log(`[POS Proxy] No authorization header found in request`);
            context.log(`[POS Proxy] Available headers:`, Object.keys(req.headers));
        }

        context.log(`[POS Proxy] Final forwarded headers:`, forwardHeaders);

        // Use native https module to avoid Azure Functions auth injection
        const targetURL = new URL(targetUrl);
        const requestBody = req.method !== 'GET' && req.body ? JSON.stringify(req.body) : null;
        
        const options = {
            hostname: targetURL.hostname,
            port: 443,
            path: targetURL.pathname + targetURL.search,
            method: req.method,
            headers: forwardHeaders
        };

        context.log(`[POS Proxy] Making request to: ${targetURL.hostname}${targetURL.pathname}${targetURL.search}`);

        // Make the request using native https
        const response = await new Promise((resolve, reject) => {
            const request = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    resolve({
                        status: res.statusCode,
                        statusText: res.statusMessage,
                        headers: res.headers,
                        text: () => Promise.resolve(data)
                    });
                });
            });

            request.on('error', (error) => {
                reject(error);
            });

            if (requestBody) {
                request.write(requestBody);
            }
            
            request.end();
        });

        const responseData = await response.text();
        
        context.log(`[POS Proxy] Response status: ${response.status}`);
        if (response.status === 401) {
            context.log(`[POS Proxy] 401 Unauthorized - Auth header was: ${authHeader ? authHeader.substring(0, 20) + '...' : 'MISSING'}`);
            context.log(`[POS Proxy] Target URL was: ${targetUrl}`);
            context.log(`[POS Proxy] Forwarded headers:`, forwardHeaders);
        }
        context.log(`[POS Proxy] Response headers:`, response.headers);
        context.log(`[POS Proxy] Response body:`, responseData);

        // For debugging: if 401, include debug info in response
        let debugInfo = '';
        if (response.status === 401) {
            debugInfo = `\n\nDEBUG INFO:\n- Target URL: ${targetUrl}\n- Auth header sent: ${authHeader ? 'YES (length: ' + authHeader.length + ')' : 'NO'}\n- Forwarded headers: ${JSON.stringify(forwardHeaders, null, 2)}`;
        }

        // Return the response
        context.res = {
            status: response.status,
            headers: {
                ...context.res.headers,
                'Content-Type': response.headers['content-type'] || 'application/json'
            },
            body: responseData + debugInfo
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
