import { useCallback, useEffect, useRef, useState } from "react";

type TrackerStatus = "idle" | "tracking" | "paused";
type StepSource = "motion" | "gps";
type PositionSample = {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
};

export type WalkSummary = {
  steps: number;
  distanceMeters: number;
  elapsedMs: number;
  source: StepSource;
};

type MotionPermissionEvent = typeof DeviceMotionEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

const MAX_ACCURACY_METERS = 50;
const MAX_SAMPLE_GAP_MS = 20_000;
const MIN_WALK_SPEED_MPS = 0.35;
const MAX_WALK_SPEED_MPS = 2.8;
const STEP_PEAK_THRESHOLD = 0.45;
const STEP_RELEASE_THRESHOLD = 0.15;
const MIN_STEP_INTERVAL_MS = 300;
const MOTION_SENSOR_STARTUP_TIMEOUT_MS = 5_000;

function distanceBetween(first: PositionSample, second: PositionSample) {
  const earthRadiusMeters = 6_371_000;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = toRadians(second.latitude - first.latitude);
  const longitudeDelta = toRadians(second.longitude - first.longitude);
  const firstLatitude = toRadians(first.latitude);
  const secondLatitude = toRadians(second.latitude);
  const haversine = Math.min(
    1,
    Math.max(
      0,
      Math.sin(latitudeDelta / 2) ** 2 +
        Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.sin(longitudeDelta / 2) ** 2
    )
  );

  return earthRadiusMeters * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(Math.max(0, 1 - haversine)));
}

export function useGpsStepTracker(stepLengthCm: number) {
  const [status, setStatus] = useState<TrackerStatus>("idle");
  const [steps, setSteps] = useState(0);
  const [gpsDistanceMeters, setGpsDistanceMeters] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [error, setError] = useState("");
  const [stepSource, setStepSource] = useState<StepSource>("motion");
  const watchId = useRef<number | null>(null);
  const previousPosition = useRef<PositionSample | null>(null);
  const gpsDistanceTotal = useRef(0);
  const stepTotal = useRef(0);
  const accumulatedTime = useRef(0);
  const trackingStartedAt = useRef<number | null>(null);
  const sessionStrideLengthCm = useRef(stepLengthCm);
  const motionAvailable = useRef(false);
  const gravityMagnitude = useRef<number | null>(null);
  const filteredAcceleration = useRef(0);
  const lastStepAt = useRef(0);
  const peakArmed = useRef(true);
  const lastMotionSampleAt = useRef(0);
  const starting = useRef(false);
  const configuredStrideLengthCm =
    Number.isFinite(stepLengthCm) && stepLengthCm >= 30 && stepLengthCm <= 120 ? stepLengthCm : 78;

  const getElapsed = useCallback(() => {
    if (trackingStartedAt.current === null) return accumulatedTime.current;
    return accumulatedTime.current + Date.now() - trackingStartedAt.current;
  }, []);

  const stopWatching = useCallback(() => {
    if (watchId.current !== null && "geolocation" in navigator) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    window.removeEventListener("devicemotion", handleDeviceMotion);
  }, []);

  const handleDeviceMotion = useCallback((event: DeviceMotionEvent) => {
    const acceleration = event.acceleration ?? event.accelerationIncludingGravity;
    if (acceleration?.x == null || acceleration.y == null || acceleration.z == null) return;

    const magnitude = Math.hypot(acceleration.x, acceleration.y, acceleration.z);
    if (!Number.isFinite(magnitude)) return;
    lastMotionSampleAt.current = Date.now();

    if (gravityMagnitude.current === null) {
      gravityMagnitude.current = magnitude;
      return;
    }

    gravityMagnitude.current += 0.9 * (magnitude - gravityMagnitude.current);
    const dynamicAcceleration = magnitude - gravityMagnitude.current;
    filteredAcceleration.current = 0.65 * filteredAcceleration.current + 0.35 * dynamicAcceleration;

    const now = event.timeStamp || Date.now();
    if (filteredAcceleration.current <= STEP_RELEASE_THRESHOLD) peakArmed.current = true;
    if (
      peakArmed.current &&
      filteredAcceleration.current >= STEP_PEAK_THRESHOLD &&
      now - lastStepAt.current >= MIN_STEP_INTERVAL_MS
    ) {
      lastStepAt.current = now;
      peakArmed.current = false;
      stepTotal.current += 1;
      setSteps(stepTotal.current);
    }
  }, []);

  const start = useCallback(async () => {
    if (starting.current || watchId.current !== null || trackingStartedAt.current !== null) return;
    starting.current = true;
    setError("");

    if (status === "idle") {
      previousPosition.current = null;
      gpsDistanceTotal.current = 0;
      stepTotal.current = 0;
      accumulatedTime.current = 0;
      sessionStrideLengthCm.current = configuredStrideLengthCm;
      gravityMagnitude.current = null;
      filteredAcceleration.current = 0;
      lastStepAt.current = 0;
      peakArmed.current = true;
      lastMotionSampleAt.current = 0;
      setSteps(0);
      setGpsDistanceMeters(0);
      setElapsedMs(0);
    }

    const motionEvent =
      typeof DeviceMotionEvent === "undefined" ? undefined : (DeviceMotionEvent as MotionPermissionEvent);
    motionAvailable.current = typeof motionEvent !== "undefined";
    lastMotionSampleAt.current = 0;

    if (motionEvent?.requestPermission) {
      try {
        motionAvailable.current = (await motionEvent.requestPermission()) === "granted";
      } catch {
        motionAvailable.current = false;
      }
    }

    if (motionAvailable.current) {
      window.addEventListener("devicemotion", handleDeviceMotion);
      setStepSource("motion");
    } else {
      setStepSource("gps");
    }

    const secure = window.isSecureContext;
    if ("geolocation" in navigator && secure) {
      watchId.current = navigator.geolocation.watchPosition(
        (position) => {
          if (position.coords.accuracy > MAX_ACCURACY_METERS) {
            previousPosition.current = null;
            return;
          }

          const sample: PositionSample = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };
          const previous = previousPosition.current;
          previousPosition.current = sample;
          if (!previous) return;

          const elapsed = sample.timestamp - previous.timestamp;
          if (elapsed <= 0 || elapsed > MAX_SAMPLE_GAP_MS) return;

          const segmentMeters = distanceBetween(previous, sample);
          const speedMetersPerSecond = segmentMeters / (elapsed / 1000);
          const minimumReliableSegment = Math.max(0.5, (sample.accuracy + previous.accuracy) * 0.2);
          if (
            segmentMeters < minimumReliableSegment ||
            speedMetersPerSecond < MIN_WALK_SPEED_MPS ||
            speedMetersPerSecond > MAX_WALK_SPEED_MPS
          ) return;

          gpsDistanceTotal.current += segmentMeters;
          setGpsDistanceMeters(gpsDistanceTotal.current);

          if (!motionAvailable.current) {
            const gpsSteps = Math.floor(gpsDistanceTotal.current / (sessionStrideLengthCm.current / 100));
            stepTotal.current = Math.max(stepTotal.current, gpsSteps);
            setSteps(stepTotal.current);
          }
        },
        (positionError) => {
          if (positionError.code === positionError.PERMISSION_DENIED) {
            setError("GPS access was denied. Motion-sensor step counting can still work for this walk.");
          } else {
            setError("GPS signal is weak here. Counting steps with your phone sensor instead.");
          }
        },
        { enableHighAccuracy: true, maximumAge: 2_000, timeout: 15_000 }
      );
    } else if (!motionAvailable.current) {
      setError(
        !secure
          ? "Phone motion and GPS sensors require HTTPS or localhost. Open this page securely to track steps."
          : "This browser has no supported motion or GPS sensor for walk tracking."
      );
      starting.current = false;
      return;
    }

    if (!motionAvailable.current && !("geolocation" in navigator)) {
      setError("This browser has no supported motion or GPS sensor for walk tracking.");
      starting.current = false;
      return;
    }

    if (motionAvailable.current && !secure) {
      setError("GPS needs HTTPS or localhost. Phone motion step counting is active.");
    } else if (motionAvailable.current) {
      setError("");
    }

    trackingStartedAt.current = Date.now();
    setStatus("tracking");
    starting.current = false;
  }, [configuredStrideLengthCm, handleDeviceMotion, status]);

  const pause = useCallback(() => {
    if (trackingStartedAt.current !== null) {
      accumulatedTime.current = getElapsed();
      trackingStartedAt.current = null;
      setElapsedMs(accumulatedTime.current);
    }
    previousPosition.current = null;
    stopWatching();
    setStatus("paused");
  }, [getElapsed, stopWatching]);

  const reset = useCallback(() => {
    stopWatching();
    previousPosition.current = null;
    gpsDistanceTotal.current = 0;
    stepTotal.current = 0;
    accumulatedTime.current = 0;
    trackingStartedAt.current = null;
    gravityMagnitude.current = null;
    filteredAcceleration.current = 0;
    lastStepAt.current = 0;
    peakArmed.current = true;
    lastMotionSampleAt.current = 0;
    setSteps(0);
    setGpsDistanceMeters(0);
    setElapsedMs(0);
    setError("");
    setStatus("idle");
  }, [stopWatching]);

  useEffect(() => {
    if (status !== "tracking") return;
    const interval = window.setInterval(() => {
      setElapsedMs(getElapsed());
      if (
        motionAvailable.current &&
        trackingStartedAt.current !== null &&
        Date.now() -
          (lastMotionSampleAt.current || trackingStartedAt.current) >
          MOTION_SENSOR_STARTUP_TIMEOUT_MS
      ) {
        motionAvailable.current = false;
        setStepSource("gps");
        setError("No phone motion sensor signal. Using GPS distance to estimate steps instead.");
        window.removeEventListener("devicemotion", handleDeviceMotion);
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, [getElapsed, handleDeviceMotion, status]);

  useEffect(() => stopWatching, [stopWatching]);
  useEffect(() => {
    if (status === "idle") sessionStrideLengthCm.current = configuredStrideLengthCm;
  }, [configuredStrideLengthCm, status]);

  const distanceMeters =
    motionAvailable.current && stepSource === "motion"
      ? Math.max(gpsDistanceMeters, steps * (sessionStrideLengthCm.current / 100))
      : gpsDistanceMeters;

  return {
    status,
    distanceMeters,
    strideLengthCm: sessionStrideLengthCm.current,
    elapsedMs,
    steps,
    stepSource,
    error,
    start,
    pause,
    reset,
    getSummary: (): WalkSummary => ({
      steps: stepTotal.current,
      distanceMeters:
        motionAvailable.current && stepSource === "motion"
          ? Math.max(gpsDistanceTotal.current, stepTotal.current * (sessionStrideLengthCm.current / 100))
          : gpsDistanceTotal.current,
      elapsedMs: getElapsed(),
      source: stepSource,
    }),
  };
}
