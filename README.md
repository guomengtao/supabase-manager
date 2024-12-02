# Supabase Manager

A comprehensive web application for managing Supabase projects with integrated features for database management and realtime updates.

🌐 **Live Demo**: [http://supabase-manager.github.rinuo.com](http://supabase-manager.github.rinuo.com)

## Features

- 📊 **Project Information Dashboard**
- 📝 **Article Management System**
- 🔄 **Real-time Updates Demo**
- 📁 **File Storage Management**
- 🖼️ **Image Upload & Management**
- 👥 **User Management**
- 🔑 **API Key Management**
- 📚 **Interactive Tutorials**

## Tech Stack

- Frontend: HTML5, CSS3, JavaScript
- UI Framework: Bootstrap 5.3.0
- Backend: Supabase
- Storage: Supabase Storage
- Hosting: GitHub Pages with Custom Domain

## Dependencies

- [@supabase/supabase-js](https://github.com/supabase/supabase-js) v2.39.3
- [Bootstrap](https://getbootstrap.com/) v5.3.0

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/guomengtao/supabase-manager.git
   cd supabase-manager
   ```

2. Configure your Supabase credentials:
   - Copy `js/config.example.js` to `js/config.js`
   - Update with your Supabase project URL and API key

3. Serve the application:
   ```bash
   # Using Python
   python -m http.server 8000

   # Or using Node.js
   npx serve
   ```

4. Open [http://localhost:8000](http://localhost:8000) in your browser

## Tutorials

We provide step-by-step tutorials to help you understand and extend the application:

1. [Building a Project Info Page](build-info-page.html) - Learn how to create a page with project information, database statistics, and table management.

## Project Structure

```
supabase-manager/
├── index.html          # Main dashboard
├── info.html          # Project information
├── articles.html      # Article management
├── realtime.html      # Real-time demo
├── images.html        # Image management
├── files.html         # File management
├── users.html         # User management
├── api-keys.html      # API key management
├── js/
│   ├── components/    # Reusable components
│   ├── config.js      # Configuration
│   └── *.js          # Page-specific scripts
└── styles.css         # Global styles
```

## Version History

### v1.1.0 (Latest)
- Added comprehensive tutorial system
- Enhanced footer with GitHub integration
- Improved project statistics
- Added changelog and documentation

### v1.0.1
- Added footer component
- Enhanced error handling
- Improved table management
- Added project statistics

### v1.0.0
- Initial release
- Basic project setup
- Core features implementation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- GitHub Issues: [Create an issue](https://github.com/guomengtao/supabase-manager/issues)
- Documentation: See the [Tutorial Section](build-info-page.html)
- Supabase Docs: [https://supabase.com/docs](https://supabase.com/docs)

## Acknowledgments

- [Supabase](https://supabase.com) for the amazing backend platform
- [Bootstrap](https://getbootstrap.com) for the UI framework
- [GitHub Pages](https://pages.github.com) for hosting
