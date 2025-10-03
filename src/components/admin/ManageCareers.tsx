import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil } from "lucide-react";

interface Career {
  id: string;
  title: string;
  description: string;
  required_education: string;
  average_salary: string;
  growth_outlook: string;
}

interface ManageCareersProps {
  onUpdate: () => void;
}

export function ManageCareers({ onUpdate }: ManageCareersProps) {
  const { toast } = useToast();
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    required_education: "",
    average_salary: "",
    growth_outlook: "",
  });

  useEffect(() => {
    fetchCareers();
  }, []);

  const fetchCareers = async () => {
    try {
      const { data, error } = await supabase
        .from('careers')
        .select('*')
        .order('title');

      if (error) throw error;
      setCareers(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading careers",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('careers')
        .insert([formData]);

      if (error) throw error;

      toast({
        title: "Career added successfully",
      });

      setFormData({
        title: "",
        description: "",
        required_education: "",
        average_salary: "",
        growth_outlook: "",
      });
      setIsOpen(false);
      fetchCareers();
      onUpdate();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error adding career",
        description: error.message,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Manage Careers</CardTitle>
            <CardDescription>Add and manage career options</CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Career
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Career</DialogTitle>
                <DialogDescription>Enter the career details below</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Career Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="education">Required Education</Label>
                  <Input
                    id="education"
                    value={formData.required_education}
                    onChange={(e) => setFormData({ ...formData, required_education: e.target.value })}
                    placeholder="e.g., Bachelor's Degree"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="salary">Average Salary</Label>
                  <Input
                    id="salary"
                    value={formData.average_salary}
                    onChange={(e) => setFormData({ ...formData, average_salary: e.target.value })}
                    placeholder="e.g., $60,000 - $90,000"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="outlook">Growth Outlook</Label>
                  <Input
                    id="outlook"
                    value={formData.growth_outlook}
                    onChange={(e) => setFormData({ ...formData, growth_outlook: e.target.value })}
                    placeholder="e.g., Faster than average"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Add Career</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {careers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No careers added yet. Click "Add Career" to get started.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Education Required</TableHead>
                <TableHead>Salary Range</TableHead>
                <TableHead>Growth Outlook</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {careers.map((career) => (
                <TableRow key={career.id}>
                  <TableCell className="font-medium">{career.title}</TableCell>
                  <TableCell>{career.required_education}</TableCell>
                  <TableCell>{career.average_salary}</TableCell>
                  <TableCell>{career.growth_outlook}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
