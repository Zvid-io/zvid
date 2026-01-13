import { FfprobeStream } from 'fluent-ffmpeg';

export default function extractFrameRate(videoStream: FfprobeStream) {
  if (videoStream.r_frame_rate) {
    const frameRateParts = videoStream.r_frame_rate.split('/');
    if (frameRateParts.length === 2) {
      const numerator = parseInt(frameRateParts[0], 10);
      const denominator = parseInt(frameRateParts[1], 10);
      if (denominator !== 0) {
        return numerator / denominator; // Returns the frame rate as a float
      }
    }
  }
  return null;
}
