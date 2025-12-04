# BizTracker Pro

A comprehensive business management platform built with Next.js, TypeScript, and MongoDB. BizTracker Pro helps businesses streamline their operations with features for sales tracking, expense management, payroll processing, attendance monitoring, and financial analytics.

## 🚀 Features

### 📊 Dashboard & Analytics
- Real-time business metrics and KPIs
- Sales vs expenses comparison charts
- Profit margin calculations
- Company savings tracking
- Interactive data visualizations

### 👥 User Management
- Role-based access control (Admin/Worker)
- User registration and authentication
- Profile management with password updates
- Account deletion with security verification

### 💰 Sales Management
- Add, edit, and delete sales records
- Client information tracking
- Date-based filtering
- Revenue analytics and reporting

### 💸 Expense Management
- Categorized expense tracking
- Full CRUD operations on expenses
- Monthly expense summaries
- Category-wise expense analysis

### 🕐 Attendance System
- Check-in/check-out functionality
- Working hours calculation
- Date-based attendance records
- Role-based attendance views
- Admin oversight capabilities

### 💼 Payroll Management
- Monthly and daily rate payroll types
- Automated salary calculations
- Payroll history tracking
- Employee compensation management

### 🏦 Savings Management
- Company savings percentage configuration
- Profit-based savings calculations
- Savings history and tracking

### 📈 Reports & Analytics
- Comprehensive financial reports
- Attendance summaries
- Performance metrics
- Export capabilities

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Custom JWT-based auth
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB database
- npm/yarn/pnpm package manager

## ⚡ Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd manage
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/biztracker
   # or your MongoDB Atlas connection string
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔐 Authentication & Roles

### Admin Role
- Full system access
- User management capabilities
- All CRUD operations
- System-wide analytics
- Payroll and savings management

### Worker Role
- Personal attendance tracking
- View own records
- Profile management
- Limited dashboard access

## 📱 User Interface

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interactions
- Adaptive layouts

### Professional UI/UX
- Modern gradient designs
- Intuitive navigation
- Glass morphism effects
- Consistent color schemes
- Accessible components

## 🗄️ Database Schema

### Users Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: "admin" | "worker",
  salary: Number,
  payrollType: "monthly_salary" | "daily_rate",
  dailyRate: Number,
  status: "active" | "inactive",
  createdAt: Date
}
```

### Sales Collection
```javascript
{
  userId: ObjectId,
  date: Date,
  amount: Number,
  clientName: String,
  description: String
}
```

### Expenses Collection
```javascript
{
  userId: ObjectId,
  date: Date,
  amount: Number,
  category: String,
  description: String
}
```

### Attendance Collection
```javascript
{
  userId: ObjectId,
  date: Date,
  checkInTime: Date,
  checkOutTime: Date,
  status: "present" | "absent" | "late",
  workingHours: Number
}
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/check` - Check authentication status

### Users
- `GET /api/users` - Get all users (admin only)
- `POST /api/users` - Create new user (admin only)
- `PATCH /api/users` - Update user (admin only)
- `DELETE /api/users` - Delete user (admin only)

### Profile
- `GET /api/profile` - Get current user profile
- `PUT /api/profile` - Update profile/password
- `DELETE /api/profile` - Delete own account

### Sales
- `GET /api/sales` - Get sales records
- `POST /api/sales` - Create sale
- `PUT /api/sales` - Update sale
- `DELETE /api/sales` - Delete sale

### Expenses
- `GET /api/expenses` - Get expense records
- `POST /api/expenses` - Create expense
- `PUT /api/expenses` - Update expense
- `DELETE /api/expenses` - Delete expense

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Mark attendance

### Analytics
- `GET /api/analytics` - Get business analytics

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy automatically

### Manual Deployment
1. Build the application:
   ```bash
   npm run build
   ```
2. Start production server:
   ```bash
   npm start
   ```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- CORS protection
- Environment variable protection

## 📊 Performance

- Server-side rendering (SSR)
- Static generation where applicable
- Optimized images and fonts
- Efficient database queries
- Responsive design patterns

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🔄 Version History

- **v1.0.0** - Initial release with core features
- Full business management suite
- Role-based authentication
- Comprehensive analytics
- Mobile-responsive design

---

**BizTracker Pro** - Streamline Your Business Operations 🚀
