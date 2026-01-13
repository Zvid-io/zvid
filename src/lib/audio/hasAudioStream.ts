import { FfprobeData } from 'fluent-ffmpeg';

export default function hasAudioStream(metadata: FfprobeData) {
  return metadata.streams.some((stream: any) => stream.codec_type === 'audio');
}
