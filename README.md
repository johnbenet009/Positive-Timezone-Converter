# Positive Timezone Converter

A simple, elegant time zone converter built with React and TypeScript that allows you to track multiple time zones simultaneously relative to Nigerian time (GMT+1).

![Positive Timezone Converter](https://images.unsplash.com/photo-1501139083538-0139583c060f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80)

## Features

- **Add Custom Time Zones**: Add any time zone with a custom name and UTC/GMT offset
- **Real-time Conversion**: See the current time in each time zone updating in real-time
- **Dark/Light Mode**: Toggle between dark and light themes for comfortable viewing
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Persistent Storage**: Your time zones are saved in your browser's local storage
- **No External APIs**: Works completely offline with no external dependencies

## Live Demo

Check out the live demo: [Positive Timezone Converter](https://github.com/johnbenet009/Positive-Timezone-Converter)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/johnbenet009/Positive-Timezone-Converter.git
   cd Positive-Timezone-Converter
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

To create a production build:

```bash
npm run build
```

The build files will be generated in the `dist` directory. You can serve these files using any static file server.

For a quick local preview of the production build:

```bash
npm run preview
```

## Usage

1. **Adding a Time Zone**:
   - Click the "+" button in the top right corner
   - Enter a name for the time zone (e.g., "New York", "London")
   - Enter the time zone offset in the format "UTC-4" or "GMT+2"
   - Click "Add"

2. **Deleting a Time Zone**:
   - Click the trash icon on any time zone card

3. **Switching Between Dark/Light Mode**:
   - Click the sun/moon icon in the top right corner

## Customization

Feel free to modify this project to suit your needs. Some ideas for customization:

- Add support for more precise time zone offsets (including minutes)
- Implement time zone search functionality
- Add the ability to sort or reorder time zones
- Implement time difference calculations between zones
- Add calendar integration for scheduling across time zones

## Contributing

Contributions are welcome! Feel free to fork the repository and submit pull requests.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Built with [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), and [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Created by [johnbenet009](https://github.com/johnbenet009)

---

Made with ❤️ by Positive Developer