const https = require('https');
const { URL } = require('url');

module.exports = async function (context, req) {
    // Set CORS headers
    context.res.headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Item-Authorization, X-Requested-With, lrs-userid',
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
        // Get the path and environment from the route parameters
        const path = context.req.params.path || '';
        const environment = context.req.params.env || 'test';
        
        // Environment URLs for Item Service API
        const environments = {
            dev: 'https://itemservice.egretail-dev.cloud/api',
            test: 'https://itemservice.egretail-test.cloud/api',
            prod: 'https://itemservice.egretail.cloud/api'
        };
        
        const baseUrl = environments[environment] || environments.test;
        const targetUrl = `${baseUrl}/${path}`;

        context.log(`[Item Service Proxy v1.0] ${req.method} ${targetUrl}`);
        context.log(`[Item Service Proxy] Request headers:`, req.headers);
        context.log(`[Item Service Proxy] Request body:`, req.body);

        // Build headers for forwarding
        const forwardHeaders = {
            'User-Agent': 'LAS-POS-Azure-Proxy/1.0',
            'lrs-userid': req.headers['lrs-userid'] || 'ZGV2ZWxvcGVy'
        };

        // Only add Content-Type for non-GET requests
        if (req.method !== 'GET') {
            forwardHeaders['Content-Type'] = 'application/json';
        }

        // Handle authorization headers (both standard and custom)
        // Note: Azure Functions normalizes headers to lowercase
        const customAuthHeader = req.headers['x-item-authorization'];
        const standardAuthHeader = req.headers['authorization'];
        
        context.log(`[Item Service Proxy] Debug headers check:`);
        context.log(`[Item Service Proxy] - x-item-authorization: ${customAuthHeader ? 'YES (length: ' + customAuthHeader.length + ')' : 'NO'}`);
        context.log(`[Item Service Proxy] - authorization: ${standardAuthHeader ? 'YES (length: ' + standardAuthHeader.length + ')' : 'NO'}`);
        
        if (customAuthHeader) {
            // Client sent custom header to bypass Azure auth injection
            forwardHeaders['Authorization'] = customAuthHeader;
            context.log(`[Item Service Proxy] Using CUSTOM authorization header: ${customAuthHeader.substring(0, 20)}...`);
        } else if (standardAuthHeader) {
            // Fallback to standard header (development mode)
            forwardHeaders['Authorization'] = standardAuthHeader;
            context.log(`[Item Service Proxy] Using standard authorization header: ${standardAuthHeader.substring(0, 20)}...`);
        } else {
            context.log(`[Item Service Proxy] No authorization header found in request`);
            context.log(`[Item Service Proxy] Available headers:`, Object.keys(req.headers));
        }

        context.log(`[Item Service Proxy] Final forwarded headers:`, forwardHeaders);
        context.log(`[Item Service Proxy] Final Authorization header length: ${forwardHeaders.Authorization ? forwardHeaders.Authorization.length : 'NONE'}`);
        
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

        context.log(`[Item Service Proxy] Making request to: ${targetURL.hostname}${targetURL.pathname}${targetURL.search}`);

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
        
        context.log(`[Item Service Proxy] Response status: ${response.status}`);
        context.log(`[Item Service Proxy] Response length: ${responseData.length} characters`);
        
        if (response.status >= 400) {
            context.log(`[Item Service Proxy] Error response details:`);
            context.log(`[Item Service Proxy] - Status: ${response.status} ${response.statusText}`);
            context.log(`[Item Service Proxy] - Response headers:`, response.headers);
            context.log(`[Item Service Proxy] - Response body (first 500 chars):`, responseData.substring(0, 500));
            context.log(`[Item Service Proxy] - Request was: ${req.method} ${targetUrl}`);
            context.log(`[Item Service Proxy] - Auth header length: ${forwardHeaders.Authorization ? forwardHeaders.Authorization.length : 'NONE'}`);
        } else {
            context.log(`[Item Service Proxy] Success response body:`, responseData);
        }
        
        if (response.status === 401) {
            context.log(`[Item Service Proxy] 401 Unauthorized - Auth header was: ${(customAuthHeader || standardAuthHeader) ? (customAuthHeader || standardAuthHeader).substring(0, 20) + '...' : 'MISSING'}`);
            context.log(`[Item Service Proxy] Target URL was: ${targetUrl}`);
            context.log(`[Item Service Proxy] Forwarded headers:`, forwardHeaders);
        }

        // For debugging: if 401, include debug info in response
        let debugInfo = '';
        if (response.status === 401) {
            debugInfo = `\n\nDEBUG INFO:\n- Target URL: ${targetUrl}\n- Custom auth header: ${customAuthHeader ? 'YES (length: ' + customAuthHeader.length + ')' : 'NO'}\n- Standard auth header: ${standardAuthHeader ? 'YES (length: ' + standardAuthHeader.length + ')' : 'NO'}\n- Forwarded headers: ${JSON.stringify(forwardHeaders, null, 2)}`;
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
        context.log.error('[Item Service Proxy] Error:', error);
        context.log.error('[Item Service Proxy] Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            code: error.code
        });
        
        context.res = {
            status: 500,
            headers: context.res.headers,
            body: JSON.stringify({
                error: 'Proxy error',
                message: error.message,
                timestamp: new Date().toISOString(),
                requestMethod: req.method,
                requestPath: context.req.params.path,
                errorType: error.name || 'Unknown'
            })
        };
    }
};
