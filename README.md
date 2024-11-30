# Supabase Manager

A comprehensive web application for managing and interacting with Supabase projects. Built with HTML, JavaScript, and Bootstrap, hosted on GitHub Pages.

🌐 **Live Demo**: [http://supabase-manager.github.rinuo.com](http://supabase-manager.github.rinuo.com)

## Features

- 📊 **Dashboard**
  - Real-time database statistics
  - Recent activities tracking
  - Quick access to project credentials

- 📋 **Project Info**
  - Project details display
  - Table schema information
  - Connection status monitoring

- 📝 **Articles Management**
  - Full CRUD operations
  - Tag management
  - URL tracking
  - Soft delete functionality

- ⚡ **Real-time Connection**
  - Live table change subscriptions
  - Event logging
  - Connection status monitoring

- 🖼️ **Image Upload**
  - Drag and drop support
  - Image preview
  - File type validation
  - 5MB size limit
  - Public URL generation

- 📁 **File Manager**
  - Multi-file upload support
  - Storage usage tracking
  - File search functionality
  - 50MB size limit
  - Link generation

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
   ```

2. Configure Supabase:
   - Create a new project on [Supabase](https://supabase.com)
   - Update `js/config.js` with your project URL and anon key
   - Create necessary storage buckets: 'images' and 'files'
   - Set up the following tables:
     ```sql
     -- Articles table
     create table articles (
       id uuid default uuid_generate_v4() primary key,
       title text not null,
       content text not null,
       created_at timestamp with time zone default timezone('utc'::text, now()) not null,
       updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
       is_deleted boolean default false,
       url text,
       tags text[]
     );
     ```

3. Deploy:
   - Push to GitHub
   - Enable GitHub Pages in your repository settings
   - Set the branch to `main` and folder to `/ (root)`
   - Configure custom domain (optional):
     1. Add a CNAME file with your domain
     2. Configure DNS settings:
        ```
        Type: A
        Name: supabase-manager.github
        Value: 185.199.108.153
        ```
        ```
        Type: CNAME
        Name: supabase-manager.github
        Value: guomengtao.github.io
        ```

## Usage

Visit [http://supabase-manager.github.rinuo.com](http://supabase-manager.github.rinuo.com) or your deployed instance and use the navigation menu to access different features:

- **Dashboard**: View project statistics and connection details
- **Project Info**: Explore database schema and project configuration
- **Articles**: Manage your articles with tags and URLs
- **Real-time**: Monitor real-time database changes
- **Image Upload**: Upload and manage images
- **File Manager**: Handle file uploads and storage

## Security Considerations

- Content Security Policy (CSP) implemented
- Strict HTTPS enforcement
- File type validation
- Size restrictions for uploads
- Cross-origin resource sharing configured
- Security headers implemented:
  - X-Content-Type-Options
  - X-Frame-Options
  - Strict-Transport-Security

## Development

- **Local Development**:
  ```bash
  # Using Python's built-in server
  python -m http.server 8000
  # Or using Node.js http-server
  npx http-server
  ```

- **Code Style**:
  - ESLint for JavaScript linting
  - Prettier for code formatting
  - Bootstrap conventions for HTML/CSS

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Supabase](https://supabase.com) for the amazing backend platform
- [Bootstrap](https://getbootstrap.com) for the UI framework
- [GitHub Pages](https://pages.github.com) for hosting
