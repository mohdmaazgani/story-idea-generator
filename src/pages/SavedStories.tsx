import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Feather, Trash2, ArrowLeft } from "lucide-react";

interface SavedStory {
  id: string;
  title: string;
  content: string;
  genre: string;
  theme: string;
  character_type: string;
  created_at: string;
}

const SavedStories = () => {
  const [stories, setStories] = useState<SavedStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    fetchStories();
  }, [user, navigate]);

  const fetchStories = async () => {
    try {
      const { data, error } = await supabase
        .from("saved_stories")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setStories(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load saved stories.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("saved_stories")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setStories(stories.filter((story) => story.id !== id));
      toast({
        title: "Story deleted",
        description: "The story has been removed from your collection.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete story.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(30,25%,88%)] via-[hsl(35,30%,85%)] to-[hsl(25,30%,82%)] py-8 px-4 flex items-center justify-center">
        <p className="font-elegant text-xl italic">Loading thy saved tales...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(30,25%,88%)] via-[hsl(35,30%,85%)] to-[hsl(25,30%,82%)] py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="font-elegant italic border-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Generator
            </Button>
          </div>

          <div className="text-center space-y-6 animate-fade-in">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Feather className="w-10 h-10 text-primary" strokeWidth={1.5} />
            </div>
            <h1 className="font-handwritten text-6xl md:text-7xl text-foreground italic">
              Thy Saved Stories
            </h1>
            <p className="font-elegant italic text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A collection of thy cherished tales
            </p>
          </div>

          {stories.length === 0 ? (
            <Card className="burnt-edges bg-gradient-to-br from-card to-accent shadow-2xl border-2 border-[hsl(25,30%,60%)]">
              <CardContent className="pt-12 pb-12">
                <p className="font-elegant text-xl italic text-center text-muted-foreground">
                  No saved stories yet. Generate and save thy first tale!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {stories.map((story) => (
                <Card
                  key={story.id}
                  className="burnt-edges bg-gradient-to-br from-card to-accent shadow-2xl border-2 border-[hsl(25,30%,60%)] animate-fade-in"
                >
                  <CardHeader className="border-b border-border pb-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="font-elegant text-2xl italic mb-2">
                          {story.title}
                        </CardTitle>
                        <CardDescription className="font-elegant text-base italic">
                          {story.genre} • {story.theme} • {story.character_type}
                        </CardDescription>
                      </div>
                      <Button
                        onClick={() => handleDelete(story.id)}
                        variant="outline"
                        size="icon"
                        className="border-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-8">
                    <div
                      className="handwritten text-lg md:text-xl text-card-foreground leading-loose px-4 py-6 bg-background/30 rounded-lg border border-border/50"
                      dangerouslySetInnerHTML={{ __html: story.content }}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedStories;
