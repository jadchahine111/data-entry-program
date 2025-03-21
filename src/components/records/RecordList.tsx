
import React, { useState } from 'react';
import { Record } from './RecordForm';
import { Template } from '../templates/TemplateCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Plus, FileText, Pencil, Trash2, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import RecordForm from './RecordForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface RecordListProps {
  records: Record[];
  templates: Template[];
  onCreateRecord: (record: Record) => void;
  onUpdateRecord: (record: Record) => void;
  onDeleteRecord: (recordId: string) => void;
}

const RecordList: React.FC<RecordListProps> = ({
  records,
  templates,
  onCreateRecord,
  onUpdateRecord,
  onDeleteRecord,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [deleteRecordId, setDeleteRecordId] = useState<string | null>(null);
  
  // Filter records based on selected template and search query
  const filteredRecords = records.filter(record => {
    const template = templates.find(t => t.id === record.templateId);
    
    if (!template) return false;
    
    if (selectedTemplateId !== 'all' && record.templateId !== selectedTemplateId) return false;
    
    // Search in field values
    if (searchQuery) {
      const values = Object.values(record.values);
      return values.some(value => 
        value !== null && 
        value !== undefined && 
        value.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return true;
  });
  
  const getTemplateById = (templateId: string) => {
    return templates.find(template => template.id === templateId);
  };
  
  const handleEditRecord = (record: Record) => {
    setEditingRecord(record);
  };
  
  const handleDeleteRecord = (recordId: string) => {
    setDeleteRecordId(recordId);
  };
  
  const confirmDeleteRecord = () => {
    if (deleteRecordId) {
      onDeleteRecord(deleteRecordId);
      toast.success("Record deleted successfully");
      setDeleteRecordId(null);
    }
  };
  
  const handleSubmitRecord = (record: Record) => {
    if (editingRecord) {
      onUpdateRecord(record);
      setEditingRecord(null);
    } else {
      onCreateRecord(record);
    }
  };
  
  const formatFieldValue = (value: any, fieldType: string) => {
    if (value === null || value === undefined) return '';
    
    switch (fieldType) {
      case 'date':
        return value instanceof Date ? format(value, 'PP') : value;
      case 'checkbox':
        return value ? <CheckCircle className="h-4 w-4 text-hospital-600" /> : '';
      case 'number':
        return Number(value).toString();
      default:
        return value.toString();
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="w-full sm:w-auto flex gap-2">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search records..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
            <SelectTrigger className="w-full sm:w-60">
              <SelectValue placeholder="Filter by template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Templates</SelectItem>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {templates.length > 0 && (
          <Button 
            asChild
            className="w-full sm:w-auto gap-2 bg-hospital-600 hover:bg-hospital-700"
          >
            <Link to="/templates">
              <Plus className="h-4 w-4" />
              Select Template
            </Link>
          </Button>
        )}
      </div>
      
      {templates.length === 0 ? (
        <Card className="animate-fade-in">
          <CardContent className="pt-6 pb-6 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <CardTitle className="text-xl mb-2">No templates available</CardTitle>
            <p className="text-muted-foreground mb-6">
              Create a template before adding records
            </p>
            <Button asChild className="bg-hospital-600 hover:bg-hospital-700">
              <Link to="/templates">Create Template</Link>
            </Button>
          </CardContent>
        </Card>
      ) : filteredRecords.length > 0 ? (
        <div className="space-y-6">
          {filteredRecords.map((record) => {
            const template = getTemplateById(record.templateId);
            if (!template) return null;
            
            return (
              <Card key={record.id} className="animate-fade-in hover:shadow-glass-strong transition-shadow duration-300">
                <CardHeader className="bg-hospital-50 border-b pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant="outline" className="mb-1 bg-white/90 text-xs font-normal">
                        {template.name}
                      </Badge>
                      <CardTitle className="text-lg font-medium text-hospital-800">
                        Record {record.id.slice(0, 8)}
                      </CardTitle>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Created on {format(new Date(record.createdAt), 'PPP')}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {template.fields.map((field) => (
                      <div key={field.id} className="space-y-1">
                        <div className="text-sm font-medium">{field.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {typeof formatFieldValue(record.values[field.id], field.type) === 'object' 
                            ? formatFieldValue(record.values[field.id], field.type) 
                            : formatFieldValue(record.values[field.id], field.type) || '—'}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-6">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteRecord(record.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 border-hospital-200 text-hospital-700 hover:bg-hospital-50"
                      onClick={() => handleEditRecord(record)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span>Edit</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed rounded-lg">
          {records.length > 0 ? (
            <>
              <p className="text-muted-foreground">No records match your search</p>
              <Button
                variant="link"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTemplateId('all');
                }}
                className="mt-2"
              >
                Clear filters
              </Button>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">No records created yet</p>
              <Button
                variant="link"
                asChild
                className="mt-2"
              >
                <Link to="/templates">
                  Select a template to create records
                </Link>
              </Button>
            </>
          )}
        </div>
      )}
      
      <Dialog open={!!editingRecord} onOpenChange={(open) => !open && setEditingRecord(null)}>
        <DialogContent className="max-w-4xl p-0">
          {editingRecord && (
            <RecordForm
              template={getTemplateById(editingRecord.templateId)!}
              initialData={editingRecord}
              onSubmit={handleSubmitRecord}
              onCancel={() => setEditingRecord(null)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!deleteRecordId} onOpenChange={(open) => !open && setDeleteRecordId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the record
              from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteRecord} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RecordList;
