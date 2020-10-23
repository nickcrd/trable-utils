import KalmanFilter from "./KalmanFilter";

export const getDefaultKalmanFilter = () => {
    return new KalmanFilter({ R: 0.008, Q: 4 })
}
