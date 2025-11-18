"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import { IUser } from "@/interfaces/user.interface";

interface StudentsTabProps {
  students: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }[];
}

export const EnrolledStudentsTab = ({ students }: StudentsTabProps) => {
  const handleExportData = () => {
    // Export course data
    console.log("Export data");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Enrolled Students ({students.length})</CardTitle>
        <Button variant="outline" onClick={handleExportData}>
          <Download className="h-4 w-4" />
          Export List
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {students.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="font-medium text-primary text-sm">
                    {student.firstName[0]}
                    {student.lastName[0]}
                  </span>
                </div>
                <div>
                  <div className="font-medium">
                    {student.firstName} {student.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {student.email}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline">Active</Badge>
                <Button variant="ghost" size="sm">
                  View Progress
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
