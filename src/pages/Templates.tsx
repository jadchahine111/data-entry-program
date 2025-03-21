
import React from 'react';
import Container from '@/components/layout/Container';
import TemplateList from '@/components/templates/TemplateList';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Template } from '@/components/templates/TemplateCard';
import { Record } from '@/components/records/RecordForm';
import { toast } from 'sonner';

const Templates = () => {
  const [templates, setTemplates] = useLocalStorage<Template[]>('templates', []);
  const [records, setRecords] = useLocalStorage<Record[]>('records', []);

  const handleCreateTemplate = (template: Template) => {
    setTemplates([...templates, template]);
  };

  const handleUpdateTemplate = (updatedTemplate: Template) => {
    setTemplates(templates.map(template => 
      template.id === updatedTemplate.id ? updatedTemplate : template
    ));
  };

  const handleDeleteTemplate = (templateId: string) => {
    // First check if there are records associated with this template
    const hasRecords = records.some(record => record.templateId === templateId);
    
    if (hasRecords) {
      // Ask if user wants to delete all records associated with this template
      if (window.confirm('This template has records. Delete all associated records as well?')) {
        // Delete records associated with this template
        setRecords(records.filter(record => record.templateId !== templateId));
      } else {
        toast.error("Template not deleted because it has associated records");
        return;
      }
    }
    
    // Delete the template
    setTemplates(templates.filter(template => template.id !== templateId));
  };

  return (
    <Container>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
          <p className="text-muted-foreground">
            Create and manage your data collection templates.
          </p>
        </div>
        
        <TemplateList
          templates={templates.map(template => ({
            ...template,
            recordCount: records.filter(record => record.templateId === template.id).length
          }))}
          onCreateTemplate={handleCreateTemplate}
          onUpdateTemplate={handleUpdateTemplate}
          onDeleteTemplate={handleDeleteTemplate}
        />
      </div>
    </Container>
  );
};

export default Templates;
