function success(data, message = 'Operation successful') {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
}

function error(status, errorName, message, fieldErrors = null) {
  const resp = {
    success: false,
    status,
    error: errorName,
    message,
    timestamp: new Date().toISOString()
  };
  if (fieldErrors) {
    resp.fieldErrors = fieldErrors;
  }
  return resp;
}

module.exports = {
  success,
  error
};
