"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Calendar, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const CourseDetailPage = () => {
  const course = {
    id: "1",
    title: "Faith Foundations: Understanding the Gospel",
    description:
      "This course explores the core message of the gospel, what it means to walk in faith, and how to apply biblical truths in daily life.",
    instructor: "Pastor John Doe",
    duration: "6 weeks",
    lessons: 8,
    students: 45,
    category: "Spiritual Growth",
    createdAt: "Oct 2025",
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-6 md:px-16">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {course.description}
          </p>
        </div>

        <Card className="bg-card text-card-foreground border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Course Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              {course.students} students enrolled
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              {course.duration}
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              {course.lessons} lessons
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Created {course.createdAt}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-primary">Instructor:</span>
              {course.instructor}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-primary">Category:</span>
              {course.category}
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-2xl font-semibold mb-6">Lessons</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(course.lessons)].map((_, i) => (
              <Link
                href={`/dashboard/courses/${course.id}/lesson/${i}`}
                key={i}
              >
                <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-foreground">
                        Lesson {i + 1}
                      </h3>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Overview of key faith principles and biblical truths.
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Footer Button */}
        <div className="text-center pt-10">
          <Button size="lg" variant="default">
            Start Learning
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
