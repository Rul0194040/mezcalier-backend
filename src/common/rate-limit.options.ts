export const RateLimitOptions = {
  points: 120, //cuantas solicitudes
  duration: 60, //en cuantos segundos
  whiteList: ['127.0.0.1', '::1', '::ffff:127.0.0.1'],
  maxQueueSize: 100,
  errorMessage: 'Ha sobrepasado el limite de solicitudes',
};
