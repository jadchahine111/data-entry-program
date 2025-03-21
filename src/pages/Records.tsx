
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '@/components/layout/Container';
import RecordList from '@/components/records/RecordList';
import RecordForm from '@/components/records/RecordForm';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Template } from '@/components/templates/TemplateCard';
import { Record } from '@/components/records/RecordForm';
import { toast } from 'sonner';

const Records = () => {
  const [templates] = useLocalStorage<Template[]>('templates', []);
  const [records, setRecords] = useLocalStorage<Record[]>('records', []);
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  
  const template = templateId ? templates.find(t => t.id === templateId) : null;
  
  const handleCreateRecord = (record: Record) => {
    setRecords([...records, record]);
    navigate('/records');
  };
  
  const handleUpdateRecord = (updatedRecord: Record) => {
    setRecords(records.map(record => 
      record.id === updatedRecord.id ? updatedRecord : record
    ));
  };
  
  const handleDeleteRecord = (recordId: string) => {
    setRecords(records.filter(record => record.id !== recordId));
    toast.success("Record deleted successfully");
  };
  
  // If templateId is provided and the template exists, show the form
  if (templateId && template) {
    return (
      <Container>
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">New Record</h1>
            <p className="text-muted-foreground">
              Creating a new record using the {template.name} template.
            </p>
          </div>
          
          <RecordForm
            template={template}
            onSubmit={handleCreateRecord}
            onCancel={() => navigate('/records')}
          />
        </div>
      </Container>
    );
  }
  
  return (
    <Container>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Records</h1>
          <p className="text-muted-foreground">
            View and manage all your data records.
          </p>
        </div>
        
        <RecordList
          records={records}
          templates={templates}
          onCreateRecord={handleCreateRecord}
          onUpdateRecord={handleUpdateRecord}
          onDeleteRecord={handleDeleteRecord}
        />
      </div>
    </Container>
  );
};

export default Records;
