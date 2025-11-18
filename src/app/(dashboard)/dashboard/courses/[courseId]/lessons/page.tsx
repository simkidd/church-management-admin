"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Clock, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Lessons = () => {
  const lesson = {
    id: "1",
    title: "The Power of Faith",
    duration: 40,
    content: `
      Faith is more than belief — it’s trust in action. 
      Through this lesson, we uncover how faith shapes our relationship with God 
      and empowers us to live according to His will.
    `,
    scripture: "Hebrews 11:1 — Now faith is the substance of things hoped for, the evidence of things not seen.",
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-6 md:px-16">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Link href="/dashboard/courses/1" className="text-primary flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Course
          </Link>
          <div className="flex items-center text-muted-foreground gap-2 text-sm">
            <Clock className="h-4 w-4" /> {lesson.duration} mins
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-primary mb-4">{lesson.title}</h1>
          <p className="text-muted-foreground leading-relaxed">{lesson.content}</p>
        </div>

        <Card className="bg-card border-border">
          <CardContent className="text-center italic text-primary p-6">
            “{lesson.scripture}”
          </CardContent>
        </Card>

        <div className="flex justify-between pt-8">
          <Button variant="outline" asChild>
            <Link href="/dashboard/courses/1/0">
              <ArrowLeft className="h-4 w-4 mr-1" /> Previous
            </Link>
          </Button>

          <Button asChild>
            <Link href="/dashboard/courses/2/">
              Next <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Lessons;
