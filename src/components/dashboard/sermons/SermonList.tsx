"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Play, Eye, Calendar, User, Download } from "lucide-react";
import Link from "next/link";

interface Sermon {
  id: string;
  title: string;
  preacher: string;
  date: string;
  duration: string;
  views: number;
  category: string;
  series?: string;
  audioUrl?: string;
  videoUrl?: string;
  thumbnail?: string;
}

const mockSermons: Sermon[] = [
  {
    id: "1",
    title: "The Power of Faith",
    preacher: "Pastor John",
    date: "2024-01-14",
    duration: "45:30",
    views: 156,
    category: "Teaching",
    series: "Faith Series",
  },
  {
    id: "2",
    title: "Love Your Neighbor",
    preacher: "Pastor Sarah",
    date: "2024-01-07",
    duration: "38:15",
    views: 89,
    category: "Relationship",
  },
  {
    id: "3",
    title: "Hope in Difficult Times",
    preacher: "Pastor Mike",
    date: "2023-12-31",
    duration: "52:10",
    views: 234,
    category: "Encouragement",
    series: "New Year Series",
  },
];

export function SermonList() {
  const [search, setSearch] = useState("");

  const filteredSermons = mockSermons.filter(sermon =>
    sermon.title.toLowerCase().includes(search.toLowerCase()) ||
    sermon.preacher.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search sermons..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredSermons.map((sermon) => (
          <Card key={sermon.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{sermon.title}</h3>
                      {sermon.series && (
                        <Badge variant="outline" className="mt-1">
                          {sermon.series}
                        </Badge>
                      )}
                    </div>
                    <Badge variant="secondary">{sermon.category}</Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{sermon.preacher}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(sermon.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Play className="h-4 w-4" />
                      <span>{sermon.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{sermon.views} views</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Link href={`/dashboard/sermons/${sermon.id}`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                  {sermon.audioUrl && (
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  <Button size="sm">
                    <Play className="h-4 w-4 mr-1" />
                    Play
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSermons.length === 0 && (
        <div className="text-center py-12 border rounded-lg">
          <Play className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No sermons found</h3>
          <p className="text-muted-foreground mb-4">
            {search ? "Try adjusting your search terms" : "Start by uploading your first sermon"}
          </p>
          <Link href="/dashboard/sermons/create">
            <Button>
              Upload Sermon
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}