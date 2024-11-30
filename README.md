# Supabase Manager

A comprehensive web application for managing and interacting with Supabase projects. Built with HTML, JavaScript, and Bootstrap, hosted on GitHub Pages.

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

## Dependencies

- [@supabase/supabase-js](https://github.com/supabase/supabase-js) v2.39.3
- [Bootstrap](https://getbootstrap.com/) v5.3.0

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/supabase-manager.git
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

## Usage

Visit the deployed application and use the navigation menu to access different features:

- **Dashboard**: View project statistics and connection details
- **Project Info**: Explore database schema and project configuration
- **Articles**: Manage your articles with tags and URLs
- **Real-time**: Monitor real-time database changes
- **Image Upload**: Upload and manage images
- **File Manager**: Handle file uploads and storage

## Security Considerations

- API keys are stored client-side (use environment variables in production)
- File type validation is implemented
- Size restrictions are in place for uploads
- Soft delete is used instead of hard delete

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Supabase](https://supabase.com/) for the amazing backend service
- [Bootstrap](https://getbootstrap.com/) for the UI framework
