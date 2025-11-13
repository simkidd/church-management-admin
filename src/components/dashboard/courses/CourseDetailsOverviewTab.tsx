"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Edit } from "lucide-react";
import { ICourse } from "@/interfaces/course.interface";

interface OverviewTabProps {
  course: ICourse;
}

export const CourseDetailsOverviewTab = ({ course }: OverviewTabProps) => {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">
              {course.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Total Duration:</span>
              <span className="text-muted-foreground ml-2">
                {/* {formatDuration(course.duration)} */}
              </span>
            </div>
            <div>
              <span className="font-medium">Total Lessons:</span>
              <span className="text-muted-foreground ml-2">
                {course.lessons?.length || 0}
              </span>
            </div>
            <div>
              <span className="font-medium">Enrolled Students:</span>
              <span className="text-muted-foreground ml-2">
                {course.enrolledStudents?.length || 0}
              </span>
            </div>
            <div>
              <span className="font-medium">Last Updated:</span>
              <span className="text-muted-foreground ml-2">
                {new Date(course.updatedAt!).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Activity</CardTitle>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <UserCheck className="h-4 w-4 text-green-600" />
                <div>
                  <div className="font-medium">
                    New student enrolled
                  </div>
                  <div className="text-sm text-muted-foreground">
                    2 hours ago
                  </div>
                </div>
              </div>
              <Badge variant="outline">Alice Johnson</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Edit className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="font-medium">Course updated</div>
                  <div className="text-sm text-muted-foreground">
                    1 day ago
                  </div>
                </div>
              </div>
              <Badge variant="outline">Content</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};