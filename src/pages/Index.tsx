import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Feather, Heart, LogOut, BookMarked } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

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
  const [characterName, setCharacterName] = useState<string>("");
  const [characterDetails, setCharacterDetails] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [keywords, setKeywords] = useState<string>("");
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [story, setStory] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Redirect to auth if user is not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

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
        body: { 
          genre, 
          theme, 
          characterType, 
          characterName, 
          characterDetails, 
          customPrompt,
          mode: 'story'
        }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setStory(data.storyIdea);
      
      // Save story and send email notification
      const title = `${genre} - ${theme}`;
      const userEmail = user?.email || null;
      
      // Save to database
      const { error: dbError } = await supabase
        .from("generated_stories")
        .insert({
          user_id: user?.id || null,
          user_email: userEmail,
          title,
          story_content: data.storyIdea,
          genre,
          theme,
          character_type: characterType,
        });
      
      if (dbError) {
        console.error("Error saving story to database:", dbError);
      }
      
      // Send email notification
      try {
        await supabase.functions.invoke('send-story-email', {
          body: {
            storyContent: data.storyIdea,
            genre,
            theme,
            characterType,
            title,
            userEmail,
            userName: user?.email?.split('@')[0] || 'Anonymous',
          }
        });
      } catch (emailError) {
        console.error("Error sending email:", emailError);
      }
      
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

  const handleGeneratePrompt = async () => {
    if (!keywords.trim()) {
      toast({
        title: "Missing keywords",
        description: "Please enter some keywords to generate a prompt.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingPrompt(true);
    setGeneratedPrompt("");

    try {
      const { data, error } = await supabase.functions.invoke('generate-story', {
        body: { 
          keywords,
          mode: 'prompt'
        }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setGeneratedPrompt(data.prompt);
      setCustomPrompt(data.prompt); // Auto-fill the custom prompt field
      toast({
        title: "Prompt generated!",
        description: "Your story prompt is ready.",
      });
    } catch (error: any) {
      console.error('Error generating prompt:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate prompt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const handleSaveStory = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save stories.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!story || !genre || !theme || !characterType) {
      toast({
        title: "No story to save",
        description: "Please generate a story first.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const title = `${genre} - ${theme}`;
      
      const { error } = await supabase
        .from("saved_stories")
        .insert({
          user_id: user.id,
          title,
          content: story,
          genre,
          theme,
          character_type: characterType,
        });

      if (error) throw error;

      toast({
        title: "Story saved!",
        description: "Thy tale has been added to thy collection.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save story.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "Farewell, dear writer.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(30,25%,88%)] via-[hsl(35,30%,85%)] to-[hsl(25,30%,82%)] py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="space-y-8">
          {/* Auth buttons */}
          <div className="flex justify-end gap-3">
            {user ? (
              <>
                <Button
                  onClick={() => navigate("/saved-stories")}
                  variant="outline"
                  className="font-elegant italic border-2"
                >
                  <BookMarked className="mr-2 h-4 w-4" />
                  My Stories
                </Button>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="font-elegant italic border-2"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button
                onClick={() => navigate("/auth")}
                variant="outline"
                className="font-elegant italic border-2"
              >
                Sign In
              </Button>
            )}
          </div>

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

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="font-elegant text-base font-semibold text-foreground italic">Character Name (Optional)</label>
                  <input
                    type="text"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    placeholder="e.g., Eleanor, Marcus..."
                    className="w-full px-4 py-2 rounded-md border border-border bg-background/80 font-elegant italic text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-3">
                  <label className="font-elegant text-base font-semibold text-foreground italic">Character Details (Optional)</label>
                  <input
                    type="text"
                    value={characterDetails}
                    onChange={(e) => setCharacterDetails(e.target.value)}
                    placeholder="e.g., age, profession, traits..."
                    className="w-full px-4 py-2 rounded-md border border-border bg-background/80 font-elegant italic text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-border">
                <label className="font-elegant text-base font-semibold text-foreground italic">Generate Story Prompt from Keywords</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="Enter keywords (e.g., 'abandoned lighthouse, mysterious letter')"
                    className="flex-1 px-4 py-2 rounded-md border border-border bg-background/80 font-elegant italic text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button
                    onClick={handleGeneratePrompt}
                    disabled={isGeneratingPrompt}
                    variant="outline"
                    className="font-elegant italic border-2"
                  >
                    {isGeneratingPrompt ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Generate Prompt'
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="font-elegant text-base font-semibold text-foreground italic">Custom Story Direction (Optional)</label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Add your own ideas to enhance the story..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-md border border-border bg-background/80 font-elegant italic text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
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
                <div className="mt-8 pt-6 border-t border-border space-y-4">
                  <Button 
                    onClick={handleSaveStory}
                    disabled={isSaving}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-elegant text-lg italic"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Heart className="mr-2 h-5 w-5" />
                        Save to Collection
                      </>
                    )}
                  </Button>
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
