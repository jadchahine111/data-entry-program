
import React, { useState } from 'react';
import TemplateCard, { Template } from './TemplateCard';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import TemplateForm from './TemplateForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface TemplateListProps {
  templates: Template[];
  onCreateTemplate: (template: Template) => void;
  onUpdateTemplate: (template: Template) => void;
  onDeleteTemplate: (templateId: string) => void;
}

const TemplateList: React.FC<TemplateListProps> = ({
  templates,
  onCreateTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);
  
  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
  };

  const handleDeleteTemplate = (templateId: string) => {
    setDeleteTemplateId(templateId);
  };

  const confirmDeleteTemplate = () => {
    if (deleteTemplateId) {
      onDeleteTemplate(deleteTemplateId);
      toast.success("Template deleted successfully");
      setDeleteTemplateId(null);
    }
  };

  const handleSubmitTemplate = (template: Template) => {
    if (editingTemplate) {
      onUpdateTemplate(template);
      toast.success("Template updated successfully");
      setEditingTemplate(null);
    } else {
      onCreateTemplate(template);
      toast.success("Template created successfully");
      setIsCreateDialogOpen(false);
    }
  };

  const handleCancelForm = () => {
    setEditingTemplate(null);
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            className="pl-9 w-full sm:w-80"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="w-full sm:w-auto gap-2 bg-hospital-600 hover:bg-hospital-700"
        >
          <Plus className="h-4 w-4" />
          New Template
        </Button>
      </div>
      
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={handleEditTemplate}
              onDelete={handleDeleteTemplate}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed rounded-lg">
          {templates.length > 0 ? (
            <>
              <p className="text-muted-foreground">No templates match your search</p>
              <Button
                variant="link"
                onClick={() => setSearchQuery('')}
                className="mt-2"
              >
                Clear search
              </Button>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">No templates created yet</p>
              <Button
                variant="link"
                onClick={() => setIsCreateDialogOpen(true)}
                className="mt-2"
              >
                Create your first template
              </Button>
            </>
          )}
        </div>
      )}
      
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl p-0">
          <TemplateForm
            onSubmit={handleSubmitTemplate}
            onCancel={handleCancelForm}
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={!!editingTemplate} onOpenChange={(open) => !open && setEditingTemplate(null)}>
        <DialogContent className="max-w-4xl p-0">
          {editingTemplate && (
            <TemplateForm
              initialData={editingTemplate}
              onSubmit={handleSubmitTemplate}
              onCancel={handleCancelForm}
            />
          )}
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!deleteTemplateId} onOpenChange={(open) => !open && setDeleteTemplateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the template
              and all of its records from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTemplate} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TemplateList;
