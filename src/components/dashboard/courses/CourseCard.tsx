"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ICourse } from "@/interfaces/course.interface";
import { BookOpen, Clock, Edit, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import React from "react";

const CourseCard = ({ course }: { course: ICourse }) => {
  const getStatusColor = (isPublished: boolean) => {
    return isPublished
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";
  };

  const getStatusText = (isPublished: boolean) => {
    return isPublished ? "Published" : "Draft";
  };

  return (
    <Card
      key={course._id}
      className="hover:shadow-lg transition-shadow border border-muted/20 rounded-2xl"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold leading-tight">
            {course.title}
          </CardTitle>
          <Badge
            variant="secondary"
            className={getStatusColor(course.isPublished)}
          >
            {getStatusText(course.isPublished)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {course.description}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{course?.lessons?.length || 0} lessons</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{course.duration || "N/A"}</span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Link href={`/dashboard/courses/${course._id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              View
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem variant="destructive" className="cursor-pointer">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
