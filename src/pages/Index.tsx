import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Feather } from "lucide-react";
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
  const [story, setStory] = useState<string>("");
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
    setStory("");

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

      setStory(data.storyIdea);
      toast({
        title: "Story generated!",
        description: "Your unique story is ready.",
      });
    } catch (error: any) {
      console.error('Error generating story:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate story. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(30,25%,88%)] via-[hsl(35,30%,85%)] to-[hsl(25,30%,82%)] py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="space-y-8">
          {/* Vintage Letter Header */}
          <div className="text-center space-y-6 animate-fade-in">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Feather className="w-10 h-10 text-primary" strokeWidth={1.5} />
            </div>
            <h1 className="font-handwritten text-6xl md:text-7xl text-foreground italic">
              Story Idea Generator
            </h1>
            <p className="font-elegant italic text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Let us weave a complete tale for thee...
            </p>
          </div>

          {/* Vintage Parchment Form */}
          <Card className="burnt-edges bg-gradient-to-br from-card to-accent shadow-2xl border-2 border-[hsl(25,30%,60%)]">
            <CardHeader className="border-b border-border pb-6">
              <CardTitle className="font-elegant text-3xl italic text-center">
                Compose Thy Narrative
              </CardTitle>
              <CardDescription className="font-elegant text-center text-lg italic">
                Select the elements to weave thy story
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <label className="font-elegant text-base font-semibold text-foreground italic">Genre</label>
                  <Select value={genre} onValueChange={setGenre}>
                    <SelectTrigger className="font-elegant italic bg-background/80 border-border">
                      <SelectValue placeholder="Choose genre..." />
                    </SelectTrigger>
                    <SelectContent className="font-elegant">
                      {genres.map((g) => (
                        <SelectItem key={g} value={g} className="italic">{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="font-elegant text-base font-semibold text-foreground italic">Theme</label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger className="font-elegant italic bg-background/80 border-border">
                      <SelectValue placeholder="Choose theme..." />
                    </SelectTrigger>
                    <SelectContent className="font-elegant">
                      {themes.map((t) => (
                        <SelectItem key={t} value={t} className="italic">{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="font-elegant text-base font-semibold text-foreground italic">Character Type</label>
                  <Select value={characterType} onValueChange={setCharacterType}>
                    <SelectTrigger className="font-elegant italic bg-background/80 border-border">
                      <SelectValue placeholder="Choose character..." />
                    </SelectTrigger>
                    <SelectContent className="font-elegant">
                      {characterTypes.map((c) => (
                        <SelectItem key={c} value={c} className="italic">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-elegant text-xl py-7 italic shadow-lg transition-all hover:shadow-xl"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                    Weaving thy story...
                  </>
                ) : (
                  <>
                    <Feather className="mr-3 h-5 w-5" />
                    Generate Complete Story
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Handwritten Story Response */}
          {story && (
            <Card className="burnt-edges bg-gradient-to-br from-card to-accent shadow-2xl border-2 border-[hsl(25,30%,60%)] animate-fade-in">
              <CardHeader className="border-b border-border pb-6">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Feather className="w-7 h-7 text-primary" strokeWidth={1.5} />
                  <CardTitle className="font-elegant text-3xl italic text-center">
                    Thy Story
                  </CardTitle>
                </div>
                <CardDescription className="font-elegant text-center text-base italic">
                  {genre} • {theme} • {characterType}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <div 
                  className="handwritten text-xl md:text-2xl text-card-foreground leading-loose px-4 py-6 bg-background/30 rounded-lg border border-border/50"
                  dangerouslySetInnerHTML={{ __html: story }}
                />
                <div className="mt-8 pt-6 border-t border-border">
                  <Button 
                    onClick={handleGenerate}
                    variant="outline"
                    className="w-full font-elegant text-lg italic border-2 hover:bg-accent"
                  >
                    <Feather className="mr-2 h-5 w-5" />
                    Weave Another Tale
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
