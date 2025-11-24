import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const genres = [
  "Fantasy", "Science Fiction", "Mystery", "Romance", "Horror",
  "Thriller", "Historical Fiction", "Contemporary", "Adventure", "Literary Fiction"
];

const themes = [
  "Coming of Age", "Redemption", "Betrayal", "Love & Loss", "Survival",
  "Identity", "Justice", "Family", "Revenge", "Hope", "Power", "Freedom"
];

const characterTypes = [
  "Reluctant Hero", "Anti-Hero", "Chosen One", "Mentor", "Trickster",
  "Rebel", "Innocent", "Explorer", "Caregiver", "Sage", "Warrior"
];

const Index = () => {
  const [genre, setGenre] = useState<string>("");
  const [theme, setTheme] = useState<string>("");
  const [characterType, setCharacterType] = useState<string>("");
  const [storyIdea, setStoryIdea] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!genre || !theme || !characterType) {
      toast({
        title: "Missing information",
        description: "Please select a genre, theme, and character type.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setStoryIdea("");

    try {
      const { data, error } = await supabase.functions.invoke('generate-story', {
        body: { genre, theme, characterType }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setStoryIdea(data.storyIdea);
      toast({
        title: "Story idea generated!",
        description: "Your creative prompt is ready.",
      });
    } catch (error: any) {
      console.error('Error generating story:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate story idea. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent to-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4 animate-fade-in">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              <h1 className="text-5xl md:text-6xl font-bold text-foreground">
                Story Idea Generator
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform your creative vision into captivating story prompts. Select your preferences and let AI inspire your next masterpiece.
            </p>
          </div>

          {/* Selection Form */}
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Craft Your Story</CardTitle>
              <CardDescription className="text-base">
                Choose the elements that will shape your narrative
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Genre</label>
                  <Select value={genre} onValueChange={setGenre}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Theme</label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      {themes.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Character Type</label>
                  <Select value={characterType} onValueChange={setCharacterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select character" />
                    </SelectTrigger>
                    <SelectContent>
                      {characterTypes.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg py-6"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Story Idea...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Story Idea
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Story Display */}
          {storyIdea && (
            <Card className="border-2 shadow-lg animate-fade-in bg-card">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  Your Story Idea
                </CardTitle>
                <CardDescription>
                  {genre} • {theme} • {characterType}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-lg max-w-none text-card-foreground">
                  <p className="whitespace-pre-wrap leading-relaxed">{storyIdea}</p>
                </div>
                <div className="mt-6 pt-6 border-t">
                  <Button 
                    onClick={handleGenerate}
                    variant="outline"
                    className="w-full"
                  >
                    Generate Another Idea
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;