// Type definitions for Postini App

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

export const ROUTE_TYPES = {
  A: 'A',
  B: 'B',
};

// Address structure
export const createAddress = ({
  id = null,
  street = '',
  number = '',
  city = '',
  postalCode = '',
  latitude = null,
  longitude = null,
  notes = '',
  routeType = ROUTE_TYPES.A,
  isCompleted = false,
  completedAt = null,
  createdAt = new Date().toISOString(),
}) => ({
  id,
  street,
  number,
  city,
  postalCode,
  latitude,
  longitude,
  notes,
  routeType,
  isCompleted,
  completedAt,
  createdAt,
});

// User structure
export const createUser = ({
  id = null,
  username = '',
  role = USER_ROLES.USER,
  createdAt = new Date().toISOString(),
}) => ({
  id,
  username,
  role,
  createdAt,
});

// Statistics structure
export const createStatistics = ({
  id = null,
  date = new Date().toISOString().split('T')[0],
  startTime = null,
  endTime = null,
  totalDistance = 0,
  totalStops = 0,
  routeType = ROUTE_TYPES.A,
  userId = null,
}) => ({
  id,
  date,
  startTime,
  endTime,
  totalDistance,
  totalStops,
  routeType,
  userId,
});

// Point of Interest structure
export const createPOI = ({
  id = null,
  name = '',
  type = '', // benzinaio, alimentari, negozi
  latitude = null,
  longitude = null,
  address = '',
  isActive = true,
}) => ({
  id,
  name,
  type,
  latitude,
  longitude,
  address,
  isActive,
});