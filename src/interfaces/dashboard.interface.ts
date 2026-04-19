export interface IDashboardKpis {
  totalUsers: number;
  totalCourses: number;
  publishedCourses: number;
  activeEnrollments: number;
  totalSermons: number;
  totalViews: number;
  totalCertificates: number;
}

export interface IEnrollmentStat {
  _id: "active" | "completed" | "cancelled";
  count: number;
}

export interface IUserGrowth {
  year: number;
  month: number;
  count: number;
}

export interface ITopCourse {
  courseId: string;
  title: string;
  totalEnrollments: number;
}

export interface IDashboardActivity {
  type: "enrollment";
  user: string;
  course: string;
  date: string;
}

export interface IDashboardOverview {
  kpis: IDashboardKpis;
  charts: {
    enrollmentStats: IEnrollmentStat[];
    userGrowth: IUserGrowth[];
  };
  topCourses: ITopCourse[];
  recentActivities: IDashboardActivity[];
}
