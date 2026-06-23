export const dashboardMockData = {
  monthlyRegistrations: [
    { name: "Jan", users: 120 },
    { name: "Feb", users: 190 },
    { name: "Mar", users: 240 },
    { name: "Apr", users: 210 },
    { name: "May", users: 290 },
    { name: "Jun", users: 380 },
  ],
  roleDistribution: [
    { name: "School Students", value: 35, fill: "#3b82f6" },
    { name: "College Students", value: 55, fill: "#10b981" },
    { name: "Admins", value: 10, fill: "#f59e0b" },
  ],
  activeInactiveStats: [
    { name: "Mon", active: 200, inactive: 40 },
    { name: "Tue", active: 210, inactive: 35 },
    { name: "Wed", active: 250, inactive: 50 },
    { name: "Thu", active: 240, inactive: 45 },
    { name: "Fri", active: 280, inactive: 60 },
    { name: "Sat", active: 300, inactive: 40 },
    { name: "Sun", active: 310, inactive: 30 },
  ],
  recentActivity: [
    {
      id: 1,
      type: "user",
      title: "New User Registered",
      description: "Sarah Jenkins joined as a College Student.",
      time: "2 hours ago",
      iconColor: "#3b82f6"
    },
    {
      id: 2,
      type: "job",
      title: "Job Listing Added",
      description: "Google posted 'Software Engineer II'.",
      time: "4 hours ago",
      iconColor: "#10b981"
    },
    {
      id: 3,
      type: "internship",
      title: "Internship Posted",
      description: "Microsoft posted 'Summer 2026 PM Intern'.",
      time: "5 hours ago",
      iconColor: "#8b5cf6"
    },
    {
      id: 4,
      type: "company",
      title: "New Company Onboarded",
      description: "Stripe was added to the platform.",
      time: "1 day ago",
      iconColor: "#f59e0b"
    },
  ],
  trends: {
    totalUsers: { value: "+12%", isPositive: true },
    admins: { value: "+2%", isPositive: true },
    schoolStudents: { value: "-4%", isPositive: false },
    collegeStudents: { value: "+18%", isPositive: true },
  }
};
