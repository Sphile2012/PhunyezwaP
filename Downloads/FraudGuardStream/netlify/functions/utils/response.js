/*
 * Instagram Clone - Response Helpers for Netlify Functions
 * Created by Phumeh
 */

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

const success = (data, statusCode = 200) => ({
  statusCode,
  headers,
  body: JSON.stringify(data),
});

const error = (message, statusCode = 500) => ({
  statusCode,
  headers,
  body: JSON.stringify({ message }),
});

const options = () => ({
  statusCode: 200,
  headers,
  body: '',
});

module.exports = { success, error, options, headers };
