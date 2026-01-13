import ffmpeg from 'fluent-ffmpeg';

export default async function getVideoMetaData(videoPath: string) {
  return new Promise<ffmpeg.FfprobeData>((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        resolve(metadata);
      }
    });
  });
}
