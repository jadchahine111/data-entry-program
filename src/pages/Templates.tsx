
import React from 'react';
import Container from '@/components/layout/Container';
import TemplateList from '@/components/templates/TemplateList';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Template } from '@/components/templates/TemplateCard';
import { Record } from '@/components/records/RecordForm';
import { toast } from 'sonner';

const Templates = () => {


  return (
    <Container>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
          <p className="text-muted-foreground">
            Create and manage your data collection templates.
          </p>
        </div>
        
        <TemplateList />
      </div>
    </Container>
  );
};

export default Templates;
