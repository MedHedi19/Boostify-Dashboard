# 🚀 Upskilling Admin Dashboard

A comprehensive admin dashboard for managing your upskilling and daily challenges platform.

## 🎯 Features

### 1. **Dashboard Overview** (`/dashboard`)
- Real-time statistics (users, challenges, certificates, job applications)
- Recent activity feed
- Quick action buttons
- Growth metrics

### 2. **Users Management** (`/dashboard/users`)
- View all users in a clean table format
- Search users by name or email
- Filter by status (active/blocked)
- Add new users
- Delete users
- Click on any user to view their full profile

### 3. **User Profile Detail** (`/dashboard/users/:id`)
- Complete user profile with avatar
- Activity statistics
- Recent challenges completed
- Certificates earned
- Job applications
- Actions: Block/Unblock user, Send message

### 4. **Admins Management** (`/dashboard/admins`)
- Manage platform administrators
- Assign roles and permissions
- Toggle admin status
- Add new admins with custom permissions
- Super Admin, Content Manager, and User Manager roles

### 5. **Challenges Management** (`/dashboard/challenges`)
- Create and manage daily challenges
- Track participants and completion rates
- Set difficulty levels (Beginner, Intermediate, Advanced)
- Activate/deactivate challenges
- View challenge statistics

### 6. **Certificates Management** (`/dashboard/certificates`)
- Manage certificate templates
- Track issued certificates
- Set validity periods
- Preview and edit certificates

### 7. **Job Offers Management** (`/dashboard/job-offers`)
- Post job opportunities
- Track applications
- Set deadlines
- Open/close job postings
- View application statistics

### 8. **Analytics Dashboard** (`/dashboard/analytics`)
- Platform growth metrics
- Top performing users leaderboard
- Most popular challenges
- Weekly activity heatmap
- Engagement and retention rates

## 🎨 Design Features

- **Modern UI**: Clean, professional interface with Tailwind CSS
- **Responsive**: Works on all screen sizes
- **Interactive**: Hover effects, smooth transitions
- **Color-coded**: Visual indicators for status (active/blocked, completed/pending)
- **Icon-rich**: Emoji icons for quick visual recognition
- **Modals**: User-friendly forms for adding/editing content

## 📂 File Structure

```
app/
├── components/
│   ├── Sidebar.tsx              # Navigation sidebar
│   └── DashboardLayout.tsx      # Main layout wrapper
├── routes/
│   ├── home.tsx                 # Login page
│   ├── dashboard.tsx            # Dashboard overview
│   ├── dashboard.users.tsx      # Users list
│   ├── dashboard.users.$id.tsx  # User detail page
│   ├── dashboard.admins.tsx     # Admins management
│   ├── dashboard.challenges.tsx # Challenges management
│   ├── dashboard.certificates.tsx # Certificates management
│   ├── dashboard.job-offers.tsx # Job offers management
│   └── dashboard.analytics.tsx  # Analytics dashboard
└── routes.ts                    # Route configuration
```

## 🚀 Getting Started

The application is already running on: **http://localhost:5173/**

### Login
- Navigate to the home page
- Use demo credentials:
  - Email: `admin@upskilling.com`
  - Password: `admin123`
- Click "Sign In" to access the dashboard

### Navigation
Use the sidebar on the left to navigate between different sections:
- 📊 Dashboard - Overview and statistics
- 👥 Users - Manage platform users
- 👨‍💼 Admins - Manage administrators
- 🎯 Challenges - Manage daily challenges
- 🎓 Certificates - Manage certificates
- 💼 Job Offers - Manage job postings
- 📈 Analytics - View platform analytics

## 📊 Static Data

All data is currently **static** (mock data) for demonstration purposes. Once you integrate your database:

1. Replace mock data arrays with API calls
2. Update CRUD operations to call your backend endpoints
3. Add proper authentication and authorization
4. Implement real-time updates if needed

### Mock Data Locations
- Users: `dashboard.users.tsx` → `mockUsers` array
- Admins: `dashboard.admins.tsx` → `mockAdmins` array
- Challenges: `dashboard.challenges.tsx` → `mockChallenges` array
- Certificates: `dashboard.certificates.tsx` → `mockCertificates` array
- Job Offers: `dashboard.job-offers.tsx` → `mockJobOffers` array

## 🔧 Customization

### Adding New Sections
1. Create a new route file in `app/routes/dashboard.newsection.tsx`
2. Add the route to `app/routes.ts`
3. Add a navigation item in `app/components/Sidebar.tsx`

### Styling
- All styles use Tailwind CSS
- Main colors: Blue (#3B82F6), Purple (#9333EA), Green (#10B981)
- Customize colors in the component classes

### Features to Add (Future)
- Real database integration
- Authentication system
- Real-time notifications
- Export data (CSV/PDF)
- Advanced filtering and sorting
- Bulk actions
- Email notifications
- File uploads
- Charts and graphs (using Chart.js or Recharts)

## 🎯 Next Steps

1. **Database Integration**: Connect to your backend API
2. **Authentication**: Implement proper login/logout functionality
3. **Permissions**: Add role-based access control
4. **Real-time Updates**: Add WebSocket for live data
5. **Testing**: Add unit and integration tests
6. **Deployment**: Deploy to your preferred hosting platform

## 💡 Tips

- All tables are sortable and searchable (once connected to real data)
- Click on user names to view detailed profiles
- Use the quick action buttons on the dashboard for common tasks
- Filter options help narrow down large datasets
- Status badges are clickable to toggle status

## 🐛 Known Issues

- Currently showing linting warnings (accessibility and CSS) - these don't affect functionality
- Some Tailwind gradient classes may need adjustments based on Tailwind v4 updates

---

**Built with:** React Router 7, Tailwind CSS, TypeScript

**Status:** ✅ Ready for development and database integration
