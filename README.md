# Paste Typer

A Chrome extension that helps you paste text with a typing animation effect, making it appear as if you're typing in real-time.

## Features

- 🎭 Natural typing simulation
- ⚡ Quick paste with animation
- ⌨️ Customizable typing speed
- 📋 Works with any text input field
- 🔒 Safe and lightweight

## Installation

### From Chrome Web Store
1. Visit the Chrome Web Store (link coming soon)
2. Click "Add to Chrome"
3. Follow the prompts to complete installation

### From Source Code
1. Clone this repository
```bash
git clone https://github.com/yourusername/paste-typer.git
cd paste-typer
```

2. Install dependencies
```bash
pnpm install
```

3. Build the extension
```bash
pnpm build
```

4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked"
   - Select the `dist` directory from this project

## Development

### Available Scripts

#### `pnpm dev`
Runs the extension in development mode. The extension will automatically reload when you make changes to the code.

```bash
pnpm dev
```

#### `pnpm start`
Runs the extension in production mode for testing.

```bash
pnpm start
```

#### `pnpm build`
Builds the extension for production deployment.

```bash
pnpm build
```

## Usage

Use Paste Typer with keyboard shortcut:

- Press `Ctrl+Shift+V` (Windows/Linux) or `Command+Shift+V` (Mac)
- Your clipboard content will be pasted with a typing animation

### Customization

You can customize the typing behavior in the extension options:

1. Click the extension icon in your browser toolbar
2. Select "Options" to open the settings page
3. Adjust the following settings:
   - Base typing speed
   - Randomization factor
   - Space/punctuation delay
   - Typing strategy (Natural, Uniform, or Punctuated)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see the [LICENSE](LICENSE) file for details

## Learn More

To learn more about creating cross-browser extensions with Extension.js, visit the [official documentation](https://extension.js.org).
