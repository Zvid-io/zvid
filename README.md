<p align="center">
  <picture>
    <source srcset="https://cdn.zvid.io/assets/logo-square.png" type="image/png">
    <img src="https://cdn.zvid.io/assets/logo-square.png" alt="Zvid logo" width="180">
  </picture>
</p>

# Zvid Package

The First fully featured Node.js npm package for generating videos from JSON configurations using FFmpeg. Create dynamic videos with text overlays, images, GIFs, shapes, animations, and audio tracks programmatically.

## Features

- 🎬 **Video Composition**: Combine multiple video clips with precise timing control
- 🖼️ **Image Integration**: Add static images with positioning, scaling, and filters
- 🎭 **Animated GIFs**: Incorporate animated GIFs seamlessly into your videos
- 📝 **Text Overlays**: Add styled text with custom fonts, colors, and animations
- 💬 **Subtitles & Captions**: Add subtitle captions with timing, styling, and positioning control
- 🎨 **Vector Graphics**: Include SVG shapes and custom graphics
- 🎵 **Audio Mixing**: Background music and sound effects with timing and volume control
- ✨ **Effects & Transitions**: Apply filters, animations, and smooth transitions
- ⚡ **High Performance**: As fast as FFmpeg.

## Installation

### Install the Package

```bash
npm install zvid
```

### Install FFmpeg

FFmpeg is required for video processing.

**macOS (using Homebrew):**

```bash
brew install ffmpeg
```

**Ubuntu/Debian:**

```bash
sudo apt update && sudo apt install ffmpeg
```

**Windows (using Chocolatey):**

```bash
choco install ffmpeg
```

**Verify Installation:**

```bash
ffmpeg -version
```

For detailed installation instructions for all platforms, see our [Installation Guide](https://docs.zvid.io/docs/installation).

## Quick Start

Create your first video in just a few minutes:

```javascript
import zvid from 'zvid';

const project = {
  name: 'hello-world',
  resolution: 'full-hd', // 1920x1080
  duration: 5,
  visuals: [
    {
      type: 'TEXT',
      text: 'Hello, World!',
      position: 'center-center',
      enterBegin: 0,
      enterEnd: 1,
      exitBegin: 4,
      exitEnd: 5,
      style: {
        fontSize: '72px',
        fontFamily: 'Roboto',
        textAlign: 'center',
        fontWeight: 'bold',
      },
      enterAnimation: 'fade',
      exitAnimation: 'fade',
    },
  ],
};

await zvid(project, './output', (progress) => {
  console.log(`Progress: ${progress}%`);
});

console.log('Video created: ./output/hello-world.mp4');
```

## Popular Resolution Presets

Choose from optimized presets for different platforms:

**Social Media:**

- `instagram-post` - 1080×1080 (square)
- `instagram-reel` - 1080×1920 (vertical)
- `instagram-story` - 1080×1920 (vertical)
- `instagram-feed` - 1080×1080 (square)
- `youtube-short` - 1080×1920 (vertical)
- `youtube-video` - 1920×1080 (16:9)
- `tiktok` - 1080×1920 (vertical)
- `twitter-landscape` - 1200×675 (landscape)
- `twitter-portrait` - 720×900 (portrait)
- `twitter-square` - 1200×1200 (square)
- `facebook-video` - 1280×720 (16:9)
- `facebook-story` - 1080×1920 (vertical)
- `facebook-post` - 1200×1200 (square)
- `snapshat` - 1080x1920 (vertical)

**Traditional Formats:**

- `sd` - 640×480 (4:3)
- `hd` - 1280×720 (16:9)
- `full-hd` - 1920×1080 (16:9)
- `custom` - Use explicit width/height

## Common Use Cases

**Automated Video Generation:**

```javascript
const project = {
  name: 'promo-video',
  resolution: 'youtube-video',
  duration: 15,
  visuals: [
    {
      type: 'IMAGE',
      src: 'https://cdn.pixabay.com/photo/2016/01/19/16/27/sale-1149344_1280.jpg',
      resize: 'cover',
      enterEnd: 0.5,
      exitBegin: 14.5,
    },
    {
      type: 'TEXT',
      html: "<div style=\"position:relative;width:520px;max-width:92vw;padding:22px;border-radius:18px;overflow:hidden;background:#0f172a;border:1px solid #2a3346;box-shadow:0 18px 45px rgba(0,0,0,0.35);color:#ffffff;\" role=\"note\" aria-label=\"Summer sale banner\"><div style=\"position:absolute;top:-60px;right:-80px;width:240px;height:240px;background:rgba(255,214,102,0.22);filter:blur(6px);pointer-events:none;\" aria-hidden=\"true\"></div><div style=\"position:absolute;top:14px;left:14px;padding:6px 10px;border-radius:999px;font-size:12px;letter-spacing:0.12em;font-weight:800;background:#ff5a2a;box-shadow:0 10px 22px rgba(255,90,42,0.25);text-transform:uppercase;\">HOT</div><div style=\"margin-top:34px;display:flex;align-items:baseline;justify-content:space-between;gap:16px;padding-left:4px;\"><div style=\"font-size:22px;font-weight:800;letter-spacing:0.02em;opacity:0.95;\">Summer Sale</div><div style=\"font-size:34px;font-weight:900;line-height:1;color:#ffd666;white-space:nowrap;\">50% <span style=\"font-size:20px;font-weight:900;color:#ffffff;opacity:0.95;margin-left:6px;\">Off!</span></div></div></div>",
      position: 'center-center',
      enterEnd: 1,
      exitBegin: 14,
      style: {
        fontSize: '64px',
        color: '#ffffff',
        fontWeight: 'bold',
      },
      enterAnimation: 'slidedown',
    },
  ],
  audios: [
    {
      src: 'https://cdn.pixabay.com/audio/2025/03/19/audio_56ae1dae5f.mp3',
      volume: 0.5,
    },
  ],
};
```

## Visual Element Types

The package supports various visual element types:

- `TEXT` - Text and Styled HTML overlays with custom fonts and colors
- `IMAGE` - Static images with positioning and effects
- `VIDEO` - Video clips with timing control
- `GIF` - Animated GIFs
- `SVG` - Vector graphics and shapes

## Audio Elements
The package supports audio elements for music and voice overs.

## Subtitles/Captions
The package support the ability to add styled subtitles and captions with different modes like `karaoke`, `one-word`, and `progressive`.


## Animation and transition Effects

Apply smooth animations to your elements:

**Entrance Animations:**
`fade`, `fadeblack`, `fadewhite`, `distance`, `wipeleft`, `wiperight`, `wipeup`, `wipedown`, `slideleft`, `slideright`, `slideup`, `slidedown`, `smoothleft`, `smoothright`, `smoothup`, `smoothdown`, `circlecrop`, `rectcrop`, `circleclose`, `circleopen`, `horzclose`, `horzopen`, `vertclose`, `vertopen`, `diagbl`, `diagbr`, `diagtl`, `diagtr`, `hlslice`, `hrslice`, `vuslice`, `vdslice`, `dissolve`, `pixelize`, `radial`, `hblur`, `wipetl`, `wipetr`, `wipebl`, `wipebr`, `fadegrays`, `zoomin`, `hlwind`, `hrwind`

**Exit Animations:**
Same options available for exit animations

**Transition between videos**
Same options available for transition between videos

You can visually view these animations on [the official FFmpeg Xfade website](https://trac.ffmpeg.org/wiki/Xfade)

## Requirements

- **Node.js**: Version 18.0 or higher
- **FFmpeg**: Must be installed and available in your system PATH

## Documentation

For comprehensive guides and API documentation:

- 📖 [Full Documentation](https://docs.zvid.io/docs/intro/)
- 🚀 [Quick Start Guide](https://docs.zvid.io/docs/quick-start)
- 📚 [API Reference](https://docs.zvid.io/docs/api-reference)
- 💡 [Examples](https://docs.zvid.io/docs/examples/basic-video)


## License

Licensed under BSL 1.1 — see LICENSE

## Support & Community

- 📖 [Documentation](https://docs.zvid.io/docs/intro)
- 🐛 [Issue Tracker](https://github.com/Zvid-io/zvid/issues)
- 📦️ [npm Package](https://www.npmjs.com/package/zvid)

## Contributing

Contributions are welcome!

## Keywords

`npm` `ffmpeg` `nodejs` `video` `json-to-video` `json2video` `object-to-video` `rendering` `video-editing` `multimedia` `automation` `programmatic-video` `video-generation` `video-api` `video-rendering`
