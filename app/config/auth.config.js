module.exports = {
  secret: "bezkoder-secret-key",
  // jwtExpiration: 3600,         // 1 hour
  // jwtRefreshExpiration: 86400, // 24 hours

  /* for test */
  // jwtExpiration: 60, // 1 minute
  jwtExpiration: 3600, // 60 minute
  // jwtExpiration: "7d",
  // jwtRefreshExpiration: 120, // 2 minutes
  jwtRefreshExpiration: 3600, // 60 minutes
  // jwtRefreshExpiration: "7d", // 60 minutes
};
