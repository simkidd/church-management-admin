"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";

interface AnalyticsTabProps {
  totalStudents: number;
}

export const CourseDetailsAnalyticsTab = ({ totalStudents }: AnalyticsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-2">
            <div className="text-2xl font-bold">
              {totalStudents}
            </div>
            <div className="text-sm text-muted-foreground">
              Total Students
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold">68%</div>
            <div className="text-sm text-muted-foreground">
              Completion Rate
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold">4.8</div>
            <div className="text-sm text-muted-foreground">
              Average Rating
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold">12</div>
            <div className="text-sm text-muted-foreground">
              Active Now
            </div>
          </div>
        </div> */}

        <div className="mt-6 p-4 bg-muted/50 rounded-lg text-center">
          <BarChart3 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">
            Detailed analytics coming soon
          </p>
          {/* <Button variant="outline" className="mt-2">
            View Full Analytics
          </Button> */}
        </div>
      </CardContent>
    </Card>
  );
};