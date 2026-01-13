import {
  Item,
  AudioItem,
  Project,
  VideoItem,
  ImageItem,
  GIFItem,
  TextItem,
  SVGItem,
} from '../../types/items.type';
import getVideoMetaData from '../shared/getVideoMetaData';
import hasAudioStream from '../audio/hasAudioStream';
import {
  checkIsVideo,
  checkIsGif,
  checkIsImage,
  checkIsText,
  checkIsSvg,
} from '../elements-types/checking';
import getTextImage from '../texts/getTextImage';
import constructSVG from '../svgs/constructSVG';
import extractFrameRate from '../shared/extractFrameRate';
import calculatePosition from '../../utils/calculatePosition';
import calculateResize from '../../utils/calculateResize';

export async function applyAudioDefaults(
  audioItem: AudioItem,
  project: Pick<Project, 'duration' | 'width' | 'height'>
) {
  const projectDuration = project.duration || 10;

  // It's an AudioItem
  audioItem.audioBegin = audioItem.audioBegin ?? 0;
  audioItem.audioEnd = audioItem.audioEnd ?? projectDuration;
  audioItem.audioDuration = audioItem.audioDuration ?? projectDuration;
  audioItem.volume = audioItem.volume ?? 1;
  audioItem.track = audioItem.track ?? 0;
  audioItem.speed = audioItem.speed ?? 1;

  if (audioItem.src) {
    try {
      const audioMetaData = await getVideoMetaData(audioItem.src);
      if (hasAudioStream(audioMetaData)) {
        audioItem.audioDuration =
          audioItem.audioDuration ??
          audioMetaData.format.duration ??
          projectDuration;
        audioItem.audioEnd = audioItem.audioEnd ?? audioItem.audioDuration;
      }
    } catch (error) {
      console.warn(
        `Could not get metadata for audio: ${audioItem.src}. Using project defaults for duration.`
      );
    }
  }
}

export async function applyVisualDefaults(
  visualItem: Item,
  project: Pick<Project, 'duration' | 'width' | 'height'>
) {
  const projectDuration = project.duration || 10;

  // It's a visual item (Items type)

  visualItem.x = visualItem.x ?? 0;
  visualItem.y = visualItem.y ?? 0;
  visualItem.enterBegin = visualItem.enterBegin ?? 0;
  visualItem.enterEnd = visualItem.enterEnd ?? 0;
  visualItem.exitEnd = visualItem.exitEnd ?? projectDuration;
  visualItem.exitBegin = visualItem.exitBegin ?? projectDuration;
  visualItem.flipV = visualItem.flipV ?? false;
  visualItem.flipH = visualItem.flipH ?? false;
  visualItem.opacity = visualItem.opacity ?? 1;
  visualItem.track = visualItem.track ?? 0;
  visualItem.angle = visualItem.angle ?? 0;
  visualItem.enterAnimation = visualItem.enterAnimation ?? null;
  visualItem.exitAnimation = visualItem.exitAnimation ?? null;

  if (checkIsVideo(visualItem)) {
    const videoItem = visualItem as VideoItem;
    videoItem.videoBegin = videoItem.videoBegin ?? 0;
    videoItem.videoEnd = videoItem.videoEnd ?? projectDuration;
    videoItem.videoDuration = videoItem.videoDuration ?? projectDuration;
    videoItem.transition = videoItem.transition ?? null;
    videoItem.transitionId = videoItem.transitionId ?? null;
    videoItem.volume = videoItem.volume ?? 1;
    videoItem.speed = videoItem.speed ?? 1;

    if (videoItem.src) {
      try {
        const vidMetaData = await getVideoMetaData(videoItem.src);
        const videoStream = vidMetaData.streams.find(
          (s) => s.codec_type === 'video'
        );
        if (!videoStream) {
          throw new Error(
            `No video stream found in metadata for: ${videoItem.src}`
          );
        }
        videoItem.frameRate = Math.ceil(extractFrameRate(videoStream)!);
        videoItem.hasAudio = hasAudioStream(vidMetaData);
        if (videoStream) {
          videoItem.width =
            videoItem.width ?? videoStream.width ?? project.width;
          videoItem.height =
            videoItem.height ?? videoStream.height ?? project.height;
          videoItem.videoDuration =
            videoItem.videoDuration ??
            vidMetaData.format.duration ??
            projectDuration;
          videoItem.videoEnd = videoItem.videoEnd ?? videoItem.videoDuration;
          videoItem.exitBegin = videoItem.exitBegin ?? videoItem.videoDuration;
          videoItem.exitEnd = videoItem.exitEnd ?? videoItem.videoDuration;
        }
      } catch (error) {
        console.warn(
          `Could not get metadata for video: ${videoItem.src}. Using project defaults for width, height, and duration.`
        );
      }
    }
  } else if (checkIsImage(visualItem) || checkIsGif(visualItem)) {
    const mediaItem = visualItem as ImageItem | GIFItem;
    if (mediaItem.src) {
      try {
        const mediaMetaData = await getVideoMetaData(mediaItem.src);
        const videoStream = mediaMetaData.streams.find(
          (s) => s.codec_type === 'video' || s.codec_type === 'image'
        );
        if (videoStream) {
          mediaItem.width =
            mediaItem.width ?? videoStream.width ?? project.width;
          mediaItem.height =
            mediaItem.height ?? videoStream.height ?? project.height;
        }
      } catch (error) {
        console.warn(
          `Could not get metadata for image/gif: ${mediaItem.src}. Using project defaults for width and height.`
        );
      }
    }
  } else if (checkIsText(visualItem)) {
    const { width, height, src } = await getTextImage(visualItem as TextItem);
    const textItem = visualItem as TextItem;
    // For text, width and height depend on contentDimensions from puppeteer.
    // This will be handled in a later stage where puppeteer is available.
    // For now, we can set a fallback to project dimensions if not provided.
    textItem.width = textItem.width ?? width ?? project.width;
    textItem.height = textItem.height ?? height ?? project.height;
    textItem.imageSrc = src;
  } else if (checkIsSvg(visualItem)) {
    const svgItem = visualItem as SVGItem; // visualItem is now narrowed to SVGItem by the type guard
    const { src, width, height } = await constructSVG(visualItem as any);
    // For SVG, width and height depend on contentDimensions from puppeteer.
    // This will be handled in a later stage where puppeteer is available.
    // For now, we can set a fallback to project dimensions if not provided.
    svgItem.width = width ?? svgItem.width ?? project.width;
    svgItem.height = height ?? svgItem.height ?? project.height;
    svgItem.imageSrc = src;
  }

  // Process resize property for image/video/GIF items (overrides width and height)
  if (
    (checkIsImage(visualItem) ||
      checkIsVideo(visualItem) ||
      checkIsGif(visualItem)) &&
    'resize' in visualItem &&
    visualItem.resize
  ) {
    const mediaItem = visualItem as ImageItem | VideoItem | GIFItem;
    const resizeMode = mediaItem.resize;

    if (resizeMode) {
      // Get original dimensions from metadata if available
      let originalWidth = mediaItem.width;
      let originalHeight = mediaItem.height;

      if (mediaItem.src) {
        try {
          const mediaMetaData = await getVideoMetaData(mediaItem.src);
          const stream = mediaMetaData.streams.find(
            (s) => s.codec_type === 'video' || s.codec_type === 'image'
          );
          if (stream && stream.width && stream.height) {
            originalWidth = stream.width;
            originalHeight = stream.height;
          }
        } catch (error) {
          // Use current dimensions as fallback
        }
      }

      const resizedDimensions = calculateResize(
        resizeMode,
        originalWidth as number,
        originalHeight as number
      );

      mediaItem.width = resizedDimensions.width;
      mediaItem.height = resizedDimensions.height;
    }
  }

  // Process position property (overrides x and y coordinates)
  if ('position' in visualItem && visualItem.position) {
    const newPosition = calculatePosition(
      visualItem.position,
      visualItem.width as number,
      visualItem.height as number,
      visualItem.x,
      visualItem.y
    );

    visualItem.x = newPosition.x;
    visualItem.y = newPosition.y;
    if (
      !visualItem.anchor &&
      visualItem.position &&
      visualItem.position !== 'custom'
    ) {
      visualItem.anchor = visualItem.position;
    }
  }
}
