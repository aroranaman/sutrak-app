declare module '@mediapipe/drawing_utils' {
    export function drawConnectors(context: CanvasRenderingContext2D, landmarks: any[], connections: any[], options: any): void;
    export function drawLandmarks(context: CanvasRenderingContext2D, landmarks: any[], options: any): void;
}

declare module '@mediapipe/pose' {
    export const POSE_CONNECTIONS: any[];
    export const POSE_LANDMARKS: {
        NOSE: number;
        LEFT_EYE_INNER: number;
        LEFT_EYE: number;
        LEFT_EYE_OUTER: number;
        RIGHT_EYE_INNER: number;
        RIGHT_EYE: number;
        RIGHT_EYE_OUTER: number;
        LEFT_EAR: number;
        RIGHT_EAR: number;
        MOUTH_LEFT: number;
        MOUTH_RIGHT: number;
        LEFT_SHOULDER: number;
        RIGHT_SHOULDER: number;
        LEFT_ELBOW: number;
        RIGHT_ELBOW: number;
        LEFT_WRIST: number;
        RIGHT_WRIST: number;
        LEFT_PINKY: number;
        RIGHT_PINKY: number;
        LEFT_INDEX: number;
        RIGHT_INDEX: number;
        LEFT_THUMB: number;
        RIGHT_THUMB: number;
        LEFT_HIP: number;
        RIGHT_HIP: number;
        LEFT_KNEE: number;
        RIGHT_KNEE: number;
        LEFT_ANKLE: number;
        RIGHT_ANKLE: number;
        LEFT_HEEL: number;
        RIGHT_HEEL: number;
        LEFT_FOOT_INDEX: number;
        RIGHT_FOOT_INDEX: number;
    };

    export class Pose {
        constructor(options: any);
        setOptions(options: any): void;
        onResults(callback: (results: any) => void): void;
        send(options: { image: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement }): Promise<void>;
    }
}
