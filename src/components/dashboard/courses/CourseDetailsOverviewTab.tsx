"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ICourse } from "@/interfaces/course.interface";

interface OverviewTabProps {
  course: ICourse;
}

export const CourseDetailsOverviewTab = ({ course }: OverviewTabProps) => {
 

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
              <span className="font-medium">Last Updated:</span>
              <span className="text-muted-foreground ml-2">
                {new Date(course.updatedAt!).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      
    </div>
  );
};