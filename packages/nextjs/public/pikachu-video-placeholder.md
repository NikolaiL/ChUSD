# Pikachu Video Upload Instructions

## Video File Requirements

To add your Pikachu animation video to the page:

1. **Supported Formats**: MP4, WebM
2. **Recommended Resolution**: 400x225 or higher (16:9 aspect ratio)
3. **File Size**: Keep under 10MB for optimal loading
4. **Duration**: Recommended 5-30 seconds for loop animation

## Upload Instructions

1. Place your video file in the `/public/` directory
2. Name the file `pikachu-animation.mp4` (or `.webm`)
3. The page will automatically detect and display the video
4. If no video is found, a placeholder with instructions will be shown

## File Structure

```
packages/nextjs/public/
├── pikachu-animation.mp4    # Your Pikachu video (MP4 format)
├── pikachu-animation.webm   # Your Pikachu video (WebM format - optional)
└── ...other public files
```

## Video Optimization Tips

- Use MP4 format with H.264 codec for best browser compatibility
- Consider WebM format for smaller file sizes
- Ensure the video loops seamlessly
- Use a transparent or solid background that matches the yellow theme

## Testing

After uploading your video:
1. Start the development server: `yarn start`
2. Navigate to `/pikachu` page
3. The video should auto-play and loop
4. Test on mobile devices to ensure proper display
